import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, Map, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";

type KeywordData = {
  keyword: string;
  intent: "Informational" | "Navigational" | "Commercial" | "Transactional";
  difficulty: string;
  cluster: string;
  pillarPage: string;
};

type ContentBrief = {
  keyword: string;
  h1: string;
  titleTag: string;
  outline: string[];
  entities: string[];
};

export default function KeywordCluster() {
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<KeywordData[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<ContentBrief | null>(null);
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

  const briefMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const res = await apiRequest("POST", "/api/keywords/brief", { keyword });
      return await res.json();
    },
    onSuccess: (data) => {
      setSelectedBrief(data);
    },
    onError: () => {
      toast({ title: "Failed to generate brief", variant: "destructive" });
    },
  });

  const handleManualCluster = () => {
    if (!keywords.trim()) return;
    const keywordList = keywords.split("\n").filter((k) => k.trim());
    clusterMutation.mutate(keywordList);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV parsing: assume one keyword per line or comma separated
      const keywordList = text.split(/[\n,]/).map(k => k.trim()).filter(k => k);
      setKeywords(keywordList.join("\n"));
      toast({ title: "CSV loaded", description: `${keywordList.length} keywords found.` });
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
            <h2 className="font-semibold text-slate-200">Keyword Clustering & Strategy</h2>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Input Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Input Keywords</CardTitle>
                <CardDescription>Enter keywords manually (one per line) or upload a CSV.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="seo strategy\ncontent marketing\nkeyword research"
                  className="min-h-[200px] bg-slate-950 border-slate-800 font-mono text-sm"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <div className="flex gap-4">
                  <Button
                    onClick={handleManualCluster}
                    disabled={clusterMutation.isPending || !keywords.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500"
                  >
                    {clusterMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Map className="mr-2 h-4 w-4" />}
                    Map Keywords
                  </Button>
                  <label>
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                    <Button variant="outline" asChild className="cursor-pointer border-slate-700 hover:bg-slate-800">
                      <span>
                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                      </span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Brief View (Placeholder for now until generated) */}
            {selectedBrief && (
              <Card className="bg-slate-900 border-slate-800 animate-in fade-in slide-in-from-right-4">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Content Brief: {selectedBrief.keyword}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBrief(null)}><Loader2 className="h-4 w-4" /></Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-400">H1 Tag</h4>
                    <p className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 mt-1">{selectedBrief.h1}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-400">Title Tag</h4>
                    <p className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 mt-1">{selectedBrief.titleTag}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-400">Semantic Entities</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBrief.entities.map(e => <Badge key={e} variant="outline" className="border-slate-700">{e}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-400">Outline</h4>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1">
                      {selectedBrief.outline.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedBrief && (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-center">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a keyword to generate a content brief</p>
              </div>
            )}
          </div>

          {/* Results Table */}
          {results.length > 0 && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Topic Clusters</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const headers = ["Keyword", "Intent", "Difficulty", "Cluster", "Pillar Page"];
                    const csvContent = [
                      headers.join(","),
                      ...results.map(r => [r.keyword, r.intent, r.difficulty, r.cluster, r.pillarPage].map(f => `"${f}"`).join(","))
                    ].join("\n");

                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "keyword_strategy.csv";
                    link.click();
                  }}
                  className="border-slate-700 hover:bg-slate-800 gap-2"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-900/50">
                      <TableHead className="text-slate-400">Keyword</TableHead>
                      <TableHead className="text-slate-400">Intent</TableHead>
                      <TableHead className="text-slate-400">Difficulty</TableHead>
                      <TableHead className="text-slate-400">Cluster / Pillar</TableHead>
                      <TableHead className="text-right text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row, i) => (
                      <TableRow key={i} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="font-medium">{row.keyword}</TableCell>
                        <TableCell>
                          <Badge variant={
                            row.intent === 'Informational' ? 'secondary' :
                              row.intent === 'Navigational' ? 'outline' :
                                row.intent === 'Commercial' ? 'default' : 'destructive'
                          } className="capitalize">
                            {row.intent}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.difficulty}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-semibold text-indigo-400">{row.cluster}</div>
                            <div className="text-xs text-slate-500">{row.pillarPage}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20"
                            onClick={() => briefMutation.mutate(row.keyword)}
                            disabled={briefMutation.isPending && briefMutation.variables === row.keyword}
                          >
                            {briefMutation.isPending && briefMutation.variables === row.keyword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Brief"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
