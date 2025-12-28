import { Sidebar } from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Hash, FileText } from "lucide-react";

export default function AnalyticsPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["/api/analytics"],
    });

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Analytics Dashboard</h1>
                        <p className="text-slate-400">Overview of your SEO strategy and performance.</p>
                    </header>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Total Audits</CardTitle>
                                <FileText className="h-4 w-4 text-indigo-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-100">{isLoading ? "--" : stats?.totalAudits || 0}</div>
                                <p className="text-xs text-slate-500 mt-1">Lifetime scans performed</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Avg. SEO Score</CardTitle>
                                <BarChart3 className="h-4 w-4 text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-100">{isLoading ? "--" : stats?.avgScore || 0}</div>
                                <p className="text-xs text-slate-500 mt-1">Across all analyzed pages</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Tracked Keywords</CardTitle>
                                <Hash className="h-4 w-4 text-amber-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-100">{isLoading ? "--" : stats?.totalKeywords || 0}</div>
                                <p className="text-xs text-slate-500 mt-1">Total clustered keywords</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
