import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedPasswordBuf = Buffer.from(hashed, "hex");
    const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

declare global {
    namespace Express {
        interface User {
            id: number;
            username: string;
            isPro: boolean;
            scansToday: number;
        }
    }
}

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "dev_secret_key_123",
        resave: false,
        saveUninitialized: false,
        store: undefined,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }
    };

    app.set("trust proxy", 1);
    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user || !user.password) {
                    // For legacy users without password or bad username, fail
                    return done(null, false, { message: "Invalid username or password" });
                }

                const isValid = await comparePasswords(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: "Invalid username or password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Auth Routes
    app.post("/api/auth/register", async (req, res, next) => {
        try {
            const { username, password, name, email } = req.body;
            if (!username || !password) {
                return res.status(400).send("Username and password are required");
            }

            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const hashedPassword = await hashPassword(password);
            const user = await storage.createUser({
                username,
                password: hashedPassword,
                name,
                email,
                isPro: false
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/auth/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: User, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(400).json({ message: "Invalid username or password" });
            req.login(user, (err) => {
                if (err) return next(err);
                return res.json(user);
            });
        })(req, res, next);
    });

    app.post("/api/auth/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/auth/me", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });
}
