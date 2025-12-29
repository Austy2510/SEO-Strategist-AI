import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, BarChart3, Zap, Lock, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
    const { user } = useAuth();
    const [, navigate] = useLocation();

    if (user) {
        navigate("/dashboard");
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Navbar */}
            <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur fixed w-full z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Kola SEO</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-400 hover:text-white">Log in</Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 -z-10" />
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent pb-2">
                        Master Your SEO with <br /> Artificial Intelligence
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Instant technical audits, keyword clustering, and content strategy powered by Gemini 1.5.
                        Stop guessing and start ranking.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/login">
                            <Button size="lg" className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 rounded-full">
                                Try for Free
                            </Button>
                        </Link>
                        <p className="text-sm text-slate-500">5 Free AI Scans / Day</p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-slate-900/30 border-y border-slate-800">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Globe className="w-6 h-6 text-emerald-400" />}
                        title="Technical Audits"
                        description="Deep crawl your pages to find broken links, missing meta tags, and performance bottlenecks instantly."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="w-6 h-6 text-indigo-400" />}
                        title="Keyword Clustering"
                        description="Upload thousands of keywords and let AI group them into semantic topic clusters and pillar pages."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-amber-400" />}
                        title="Content Briefs"
                        description="Generate detailed content outlines, titles, and semantic entities optimized for search intent."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-800 bg-slate-950">
                <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Kola SEO. Built with Google Gemini.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}
