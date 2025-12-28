import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Search } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const { loginMutation, user } = useAuth();
    const [, navigate] = useLocation();

    if (user) {
        navigate("/dashboard");
        return null;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        loginMutation.mutate({ username });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Search className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">SEO Strategist AI</span>
            </div>

            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your username to access your workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? "Logging in..." : "Continue"}
                        </Button>
                        <p className="text-xs text-center text-slate-500 mt-4">
                            For this demo, any username works. It will create a new account or log you in.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
