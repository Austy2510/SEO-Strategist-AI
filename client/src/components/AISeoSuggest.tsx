import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Sparkles, TrendingUp, Target, Users, Search, Globe, Building2, Copy, Layers, FileText, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type SuggestInput, type SuggestOutput, type SeoMode } from "@shared/schema";
import { cn } from "@/lib/utils";

export function AISeoSuggest() {
    const { toast } = useToast();
    const [activeMode, setActiveMode] = useState<SeoMode>("research");

    const [formData, setFormData] = useState<SuggestInput>({
        mode: "research",
        keyword: "",
        url: "",
        country: "US",
        language: "en",
        intent: "Informational",
        businessType: "Blog",
        techStack: "wordpress",
        content: "",
        pageType: "Landing Page"
    });

    const mutation = useMutation({
        mutationFn: async (data: SuggestInput) => {
            const payload = { ...data, mode: activeMode };
            const res = await apiRequest("POST", "/api/seo/suggest", payload);
            return res.json() as Promise<SuggestOutput>;
        },
        onSuccess: () => {
            toast({ title: "Analysis Complete", description: "AI strategy generated successfully." });
        },
        onError: (error) => {
            toast({
                title: "Analysis Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Saved to clipboard" });
    };

    return (
        <div className="space-y-6">

            {/* 1. Mode Switcher (Top Level) */}
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as SeoMode)} className="w-full">
                <TabsList className="grid grid-cols-4 bg-slate-900 border border-slate-800 h-14 p-1 rounded-xl">
                    <TabsTrigger value="research" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-sm font-medium">
                        <Search className="w-4 h-4 mr-2" /> Keyword Research
                    </TabsTrigger>
                    <TabsTrigger value="website" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-sm font-medium">
                        <Globe className="w-4 h-4 mr-2" /> Website SEO
                    </TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-sm font-medium">
                        <FileText className="w-4 h-4 mr-2" /> Content Editor
                    </TabsTrigger>
                    <TabsTrigger value="page" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-sm font-medium">
                        <Layers className="w-4 h-4 mr-2" /> Page Optimizer
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* 2. Dynamic Input Form */}
            <Card className="border-slate-800 bg-slate-950 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/50 to-yellow-500/0" />
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Mode Specific Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {activeMode === "research" && (
                                <>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-medium text-slate-400">Target Keyword</label>
                                        <Input
                                            placeholder="e.g. ai copywriting tools"
                                            className="bg-slate-900 border-slate-700 focus:border-yellow-500/50 transition-colors"
                                            value={formData.keyword}
                                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-medium text-slate-400">Business Type</label>
                                        <Select value={formData.businessType} onValueChange={(val: any) => setFormData({ ...formData, businessType: val })}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800">
                                                <SelectItem value="SaaS">SaaS Product</SelectItem>
                                                <SelectItem value="E-commerce">E-commerce</SelectItem>
                                                <SelectItem value="Blog">Blog / Media</SelectItem>
                                                <SelectItem value="Service">Service Business</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {activeMode === "website" && (
                                <>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-medium text-slate-400">Website URL</label>
                                        <Input
                                            placeholder="https://example.com"
                                            className="bg-slate-900 border-slate-700"
                                            value={formData.url || ""}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-medium text-slate-400">Tech Stack</label>
                                        <Select value={formData.techStack as string} onValueChange={(val: any) => setFormData({ ...formData, techStack: val })}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800">
                                                <SelectItem value="wordpress">WordPress</SelectItem>
                                                <SelectItem value="react">React / Next.js</SelectItem>
                                                <SelectItem value="php">PHP / Laravel</SelectItem>
                                                <SelectItem value="static">Static HTML</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {activeMode === "content" && (
                                <div className="col-span-2 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Target Keyword</label>
                                        <Input
                                            placeholder="Primary keyword to optimize for"
                                            className="bg-slate-900 border-slate-700"
                                            value={formData.keyword}
                                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Content to Analyze</label>
                                        <Textarea
                                            placeholder="Paste your blog post or article draft here..."
                                            className="min-h-[150px] bg-slate-900 border-slate-700 font-mono text-sm leading-relaxed"
                                            value={formData.content || ""}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeMode === "page" && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Page Type</label>
                                        <Select value={formData.pageType} onValueChange={(val) => setFormData({ ...formData, pageType: val })}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800">
                                                <SelectItem value="Landing Page">Landing Page</SelectItem>
                                                <SelectItem value="Product Page">Product Page</SelectItem>
                                                <SelectItem value="Category Page">Category Archive</SelectItem>
                                                <SelectItem value="Article">Blog Post / Article</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Target Keyword</label>
                                        <Input
                                            placeholder="Main keyword for this page"
                                            className="bg-slate-900 border-slate-700"
                                            value={formData.keyword}
                                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                        </div>

                        {/* Action Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.01]"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Strategy...</>
                            ) : (
                                <><Sparkles className="mr-2 h-5 w-5" /> Generate AI Strategy</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* 3. Results Section */}
            {mutation.data && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                    {/* Strategy Header */}
                    {mutation.data.strategy && (
                        <Card className="border-l-4 border-l-yellow-500 bg-slate-900/50 border-y-0 border-r-0">
                            <CardContent className="pt-4">
                                <h3 className="text-yellow-500 font-bold mb-2 uppercase tracking-wider text-xs">Strategic Priorities</h3>
                                <ul className="space-y-2">
                                    {mutation.data.strategy.map((item, i) => (
                                        <li key={i} className="text-slate-200 text-sm flex items-start gap-3">
                                            <span className="bg-yellow-500/10 text-yellow-500 rounded px-1.5 py-0.5 text-xs font-mono mt-0.5">0{i + 1}</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mode: Research Results */}
                    {activeMode === "research" && mutation.data.primaryKeyword && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="col-span-3">
                                <h3 className="text-slate-400 text-sm font-medium mb-3">Keyword Intelligence</h3>
                            </div>
                            <StatsCard label="Primary Term" value={mutation.data.primaryKeyword.term} sub={mutation.data.primaryKeyword.difficulty} />
                            <StatsCard label="Search Volume" value={mutation.data.primaryKeyword.volume} sub="Monthly Est." />

                            {/* Secondary Keywords List */}
                            <Card className="col-span-3 md:col-span-3 border-slate-800 bg-slate-950">
                                <CardHeader><CardTitle className="text-base text-white">Secondary Opportunities</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {mutation.data.secondaryKeywords?.map((kw, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                <span className="text-slate-200 font-medium">{kw.term}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500 px-2 py-1 bg-slate-950 rounded">{kw.intent}</span>
                                                <span className="text-xs font-bold text-yellow-500">{kw.difficulty}</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Mode: Technical Results */}
                    {activeMode === "website" && mutation.data.technicalAudit && (
                        <div className="space-y-4">
                            {mutation.data.technicalAudit.map((item, i) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col md:flex-row gap-4 justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Code className="w-4 h-4 text-yellow-500" />
                                            <h4 className="font-semibold text-slate-200">{item.issue}</h4>
                                        </div>
                                        <p className="text-sm text-slate-400">{item.fix}</p>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                        item.priority === "High" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                    )}>{item.priority} Priority</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mode: Content Results */}
                    {activeMode === "content" && mutation.data.contentAnalysis && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-slate-800 bg-slate-950">
                                <CardHeader><CardTitle className="text-white text-base">Content Score</CardTitle></CardHeader>
                                <CardContent className="flex items-center justify-center py-6">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="#1e293b" strokeWidth="8" fill="none" />
                                            <circle cx="64" cy="64" r="60" stroke="#ca8a04" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset={377 - (377 * mutation.data.contentAnalysis.score) / 100} />
                                        </svg>
                                        <span className="absolute text-3xl font-bold text-white">{mutation.data.contentAnalysis.score}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Optimized Title</div>
                                    <div className="text-yellow-400 font-medium flex gap-2">
                                        {mutation.data.contentAnalysis.improvedTitle}
                                        <Copy className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-100" onClick={() => copyToClipboard(mutation.data.contentAnalysis!.improvedTitle)} />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Content Gaps</div>
                                    <div className="flex flex-wrap gap-2">
                                        {mutation.data.contentAnalysis.contentGaps.map((gap, i) => (
                                            <span key={i} className="text-xs bg-red-950 text-red-300 px-2 py-1 rounded border border-red-900">{gap}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mode: Page Results */}
                    {activeMode === "page" && mutation.data.onPageOptimizations && (
                        <div className="grid grid-cols-1 gap-4">
                            {mutation.data.onPageOptimizations.map((opt, i) => (
                                <div key={i} className="group p-4 bg-slate-950 border border-slate-800 hover:border-yellow-500/50 rounded-xl transition-all">
                                    <div className="text-xs text-yellow-500 font-bold uppercase mb-1">{opt.element}</div>
                                    <div className="text-slate-300 text-sm">{opt.suggestion}</div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

function StatsCard({ label, value, sub }: { label: string, value: string, sub: string }) {
    return (
        <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-6">
                <div className="text-sm text-slate-500 font-medium mb-1">{label}</div>
                <div className="text-2xl font-bold text-white mb-1 truncate">{value}</div>
                <div className="text-xs text-yellow-500/80 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {sub}
                </div>
            </CardContent>
        </Card>
    );
}
