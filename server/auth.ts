import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

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
        store: undefined, // MemoryStore by default
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }
    };

    app.set("trust proxy", 1);
    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    // Passport Setup
    passport.use(
        new LocalStrategy(async (username, _password, done) => {
            // For this MVP, we treat 'username' as the only credential needed for the 'Simulated' Replit auth
            // Real Replit Auth would use headers, but we want a login form for "Professional" feel locally
            try {
                let user = await storage.getUserByUsername(username);
                if (!user) {
                    user = await storage.createUser({ username, isPro: false });
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
    app.post("/api/auth/login", (req, res, next) => {
        // We allow any password or no password since checking only username for this MVP
        // We inject a dummy password to satisfy LocalStrategy expectation if body is just username
        if (!req.body.password) req.body.password = "dummy";

        passport.authenticate("local", (err: any, user: User, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(400).json({ message: "Login failed" });
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
