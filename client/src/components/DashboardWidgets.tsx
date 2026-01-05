
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, FileText, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/hooks/use-auth"; // For Daily Usage
import { cn } from "@/lib/utils";

// Mock Data for Sparkline
const keywordData = [
    { value: 40 }, { value: 65 }, { value: 50 }, { value: 85 }, { value: 100 }
];

export function DashboardWidgets() {
    const { user } = useAuth();

    // Mock Active Audit Status
    const auditProgress = 67; // Simulated progress
    const currentUrl = "Enter a URL to start audit";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto p-4 animate-in fade-in zoom-in duration-500">

            {/* Left Column (Main Focus) - Spans 2 cols */}
            <div className="lg:col-span-2 space-y-6">

                {/* Active Audit Progress */}
                <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 animate-shimmer" />
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" /> Active Audit Status
                            </CardTitle>
                            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">Scanning...</span>
                        </div>
                        <CardDescription className="text-slate-400">
                            Analyzing SEO metrics for <span className="text-slate-300 font-medium">{currentUrl}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
                            <span>Crawl Depth: Level 2</span>
                            <span>{auditProgress}% Complete</span>
                        </div>
                        <Progress value={auditProgress} className="h-2 bg-slate-800" indicatorClassName="bg-gradient-to-r from-indigo-500 to-emerald-500" />
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                <div className="text-2xl font-bold text-slate-200">12</div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Issues Found</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                <div className="text-2xl font-bold text-emerald-400">92</div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Performance</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                <div className="text-2xl font-bold text-indigo-400">B+</div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Est. Grade</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Critical AI Insights */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-400" /> Critical AI Insights
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <InsightCard
                            title="Missing Meta Descriptions"
                            desc="15 pages are missing descriptions, hurting CTR."
                            impact="High"
                            color="rose"
                        />
                        <InsightCard
                            title="Slow LCP Detected"
                            desc="Homepage LCP is 3.2s. Compress hero images."
                            impact="High"
                            color="amber"
                        />
                        <InsightCard
                            title="Keyword Opportunity"
                            desc="Rank #11 for 'organic seo tools'. Easy win."
                            impact="Medium"
                            color="emerald"
                        />
                    </div>
                </div>

                {/* Content Calendar */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" /> Recommended Content
                        </CardTitle>
                        <CardDescription className="text-slate-400">AI-suggested articles based on gap analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ContentSuggestion
                            title="The Ultimate Guide to Technical SEO in 2025"
                            difficulty="Medium"
                            volume="2.4k"
                            date="Schedule for: Jan 15"
                        />
                        <ContentSuggestion
                            title="Top 10 Keyword Clustering Tools Compared"
                            difficulty="Low"
                            volume="850"
                            date="Schedule for: Jan 22"
                        />
                        <ContentSuggestion
                            title="How AI is Changing Content Strategy"
                            difficulty="High"
                            volume="5.1k"
                            date="Schedule for: Jan 29"
                        />
                    </CardContent>
                </Card>

            </div>

            {/* Right Column (Sidebar/Summary) */}
            <div className="space-y-6">

                {/* Daily Usage */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Daily Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-4xl font-bold text-white">{user?.scansToday || 0}</span>
                            <span className="text-sm text-slate-500 mb-1">/ 5 Scans</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-500", (user?.scansToday || 0) >= 5 ? "bg-rose-500" : "bg-emerald-500")}
                                style={{ width: `${Math.min(((user?.scansToday || 0) / 5) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Resets in 14 hours</p>
                    </CardContent>
                </Card>

                {/* Top Keywords */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Top Keywords</CardTitle>
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-200 font-medium italic opacity-50">No keywords tracked</span>
                                    <span className="text-emerald-400 font-bold">-</span>
                                </div>
                                <div className="h-10 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={keywordData}>
                                            <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={false} />
                                            <Tooltip content={<></>} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-slate-800 mt-2">
                                <span className="text-sm text-slate-300">marketing strategy</span>
                                <span className="text-sm text-emerald-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> #7</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-slate-800">
                                <span className="text-sm text-slate-300">keyword cluster</span>
                                <span className="text-sm text-emerald-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> #12</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Competitor Watch */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Competitor Watch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <CompetitorItem name="Competitor A" change="up" value="+12%" />
                        <CompetitorItem name="Competitor B" change="down" value="-5%" />
                        <CompetitorItem name="Competitor C" change="up" value="+2.4%" />
                    </CardContent>
                </Card>

                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/50 to-violet-900/50 border border-indigo-500/20 text-center">
                    <h4 className="text-indigo-200 font-medium mb-2">Unlock Pro Insights</h4>
                    <p className="text-xs text-indigo-300/70 mb-3">Get unlimited scans and deep competitor analysis.</p>
                    <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0">Upgrade Now</Button>
                </div>

            </div>
        </div>
    );
}

function InsightCard({ title, desc, impact, color }: { title: string, desc: string, impact: string, color: "rose" | "amber" | "emerald" }) {
    const colors = {
        rose: "bg-rose-950/20 border-rose-900/50 text-rose-200",
        amber: "bg-amber-950/20 border-amber-900/50 text-amber-200",
        emerald: "bg-emerald-950/20 border-emerald-900/50 text-emerald-200"
    };

    const impactColors = {
        rose: "bg-rose-500/20 text-rose-300",
        amber: "bg-amber-500/20 text-amber-300",
        emerald: "bg-emerald-500/20 text-emerald-300"
    };

    return (
        <div className={cn("p-4 rounded-xl border flex flex-col justify-between h-full hover:scale-[1.02] transition-transform cursor-default", colors[color])}>
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{title}</h4>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider", impactColors[color])}>
                        {impact}
                    </span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">{desc}</p>
            </div>
            <div className="mt-4 flex justify-end">
                <Button variant="link" size="sm" className={cn("h-auto p-0 text-xs opacity-70 hover:opacity-100", `text-${color}-300`)}>
                    Fix Issue <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
        </div>
    );
}

function ContentSuggestion({ title, difficulty, volume, date }: { title: string, difficulty: string, volume: string, date: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-colors group">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
                    <FileText className="w-4 h-4" />
                </div>
                <div>
                    <h5 className="text-sm font-medium text-slate-200 group-hover:text-indigo-100 transition-colors">{title}</h5>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {date}</span>
                        <span className="bg-slate-800 px-1.5 rounded">{volume} vol</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    difficulty === "Low" ? "bg-emerald-500/10 text-emerald-400" :
                        difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                )}>
                    {difficulty}
                </span>
            </div>
        </div>
    );
}

function CompetitorItem({ name, change, value }: { name: string, change: "up" | "down", value: string }) {
    return (
        <div className="flex items-center justify-between p-2 rounded hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                    {name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-300">{name}</span>
            </div>
            <div className={cn("text-xs font-bold flex items-center gap-1", change === "up" ? "text-emerald-400" : "text-rose-400")}>
                {change === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {value}
            </div>
        </div>
    );
}
