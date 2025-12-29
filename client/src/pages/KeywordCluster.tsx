import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, Map, Download, Wand2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type KeywordData = {
  keyword: string;
  intent: "Informational" | "Navigational" | "Commercial" | "Transactional";
  difficulty: string;
  cluster: string;
  pillarPage: string;
  volume?: number; // Added optional field
};

type OptimizationResult = {
  optimizedContent: string;
  changes: string[];
  usedKeywords: string[];
};

export default function KeywordCluster() {
  const [activeTab, setActiveTab] = useState("cluster");
  const [inputContent, setInputContent] = useState("");
  const [results, setResults] = useState<KeywordData[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const { toast } = useToast();

  const clusterMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      const res = await apiRequest("POST", "/api/keywords/cluster", { keywords });
      return await res.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({ title: "Keywords clustered successfully" });
    },
    onError: () => {
      toast({ title: "Failed to cluster keywords", variant: "destructive" });
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/keywords/optimize", { content });
      return await res.json();
    },
    onSuccess: (data: OptimizationResult) => {
      setOptimizationResult(data);
      toast({ title: "Content optimized successfully" });
    },
    onError: () => {
      toast({ title: "Failed to optimize content", variant: "destructive" });
    },
  });

  const handleAction = () => {
    if (!inputContent.trim()) return;

    if (activeTab === "cluster") {
      const keywordList = inputContent.split(/[\n,]/).map((k) => k.trim()).filter((k) => k);
      clusterMutation.mutate(keywordList);
    } else {
      optimizeMutation.mutate(inputContent);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputContent(text);
      if (activeTab === "cluster") {
        const count = text.split(/[\n,]/).filter(x => x.trim()).length;
        toast({ title: "CSV loaded", description: `${count} keywords found.` });
      } else {
        toast({ title: "File loaded", description: "Content ready for optimization." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950/50 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Map className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold text-slate-200">Keyword & Content Strategy</h2>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-7xl mx-auto w-full h-full pb-20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800 mb-6">
              <TabsTrigger value="cluster">Keyword Clustering</TabsTrigger>
              <TabsTrigger value="optimizer">Content Optimizer</TabsTrigger>
            </TabsList>

            {/* Shared Input Area */}
            <div className="grid md:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
              <Card className="bg-slate-900 border-slate-800 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {activeTab === "cluster" ? "Input Keywords" : "Input Blog Content"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "cluster"
                      ? "Enter keywords (one per line) or upload CSV."
                      : "Paste your blog post content here to optimize it."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <Textarea
                    placeholder={activeTab === "cluster" ? "seo strategy\ncontent marketing" : "Paste your full blog post content here..."}
                    className="flex-1 bg-slate-950 border-slate-800 font-mono text-sm resize-none"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <Button
                      onClick={handleAction}
                      disabled={clusterMutation.isPending || optimizeMutation.isPending || !inputContent.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 flex-1"
                    >
                      {clusterMutation.isPending || optimizeMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        activeTab === "cluster" ? <Map className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      {activeTab === "cluster" ? "Map Keywords" : "Optimize Content"}
                    </Button>
                    <label>
                      <input type="file" accept=".csv,.txt,.md" className="hidden" onChange={handleFileUpload} />
                      <Button variant="outline" asChild className="cursor-pointer border-slate-700 hover:bg-slate-800">
                        <span><Upload className="h-4 w-4" /></span>
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Output Area */}
              <Card className="bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {activeTab === "cluster" ? "Topic Clusters" : "Optimized Content"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "cluster" ? "AI-grouped semantic topics" : "AI-rewritten content with keyword injection"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 relative">
                  <ScrollArea className="h-full w-full">
                    {activeTab === "cluster" ? (
                      results.length > 0 ? (
                        <Table>
                          <TableHeader className="bg-slate-950/50 sticky top-0">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                              <TableHead>Keyword</TableHead>
                              <TableHead>Intent</TableHead>
                              <TableHead>Cluster</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="p-4">
                            {results.map((row, i) => (
                              <TableRow key={i} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-medium">{row.keyword}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {row.intent}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-indigo-400 text-sm">{row.cluster}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                          <Map className="w-12 h-12 mb-4 opacity-20" />
                          <p>Map keywords to see clusters here</p>
                        </div>
                      )
                    ) : (
                      optimizationResult ? (
                        <div className="p-6 space-y-6">
                          <div className="prose prose-invert prose-sm max-w-none">
                            <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                              {optimizationResult.optimizedContent}
                            </div>
                          </div>

                          <Separator className="bg-slate-800" />

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                              <Wand2 className="w-4 h-4 text-emerald-400" />
                              Modifications
                            </h4>
                            <div className="grid gap-2">
                              {optimizationResult.changes.map((change, i) => (
                                <div key={i} className="text-xs text-slate-400 flex gap-2 items-start bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                  <ArrowRight className="w-3 h-3 mt-0.5 text-indigo-500 shrink-0" />
                                  {change}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-white">Keywords Used</h4>
                            <div className="flex flex-wrap gap-2">
                              {optimizationResult.usedKeywords.map((kw, i) => (
                                <Badge key={i} variant="secondary" className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border-indigo-500/20">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                          <Wand2 className="w-12 h-12 mb-4 opacity-20" />
                          <p>Optimized content will appear here</p>
                        </div>
                      )
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
