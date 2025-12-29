import { useAudit } from "@/hooks/use-audits";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronRight, BarChart3, Globe, Hash, Download } from "lucide-react";
import { useState } from "react";

interface SEOScorePanelProps {
  auditId?: number | null;
  className?: string;
}

export function SEOScorePanel({ auditId, className }: SEOScorePanelProps) {
  const { data: audit, isLoading } = useAudit(auditId);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "technical">("overview");

  if (!audit && !isLoading) return null;

  // Mock data if loading or just starting
  const score = audit?.score ?? 0;
  const isGood = score >= 80;
  const isAvg = score >= 50 && score < 80;

  const scoreColor = isGood ? "text-emerald-400" : isAvg ? "text-amber-400" : "text-rose-400";
  const ringColor = isGood ? "stroke-emerald-500" : isAvg ? "stroke-amber-500" : "stroke-rose-500";

  // Parse new fields safely
  const images = (audit?.images as any[]) || [];
  const links = (audit?.links as any[]) || [];
  const loadTime = audit?.loadTime || 0;
  const performanceScore = audit?.performanceScore || 0;

  const missingAlts = images.filter(img => !img.hasAlt).length;
  const criticalErrors = [
    !audit?.title && "Missing Title Tag",
    !audit?.metaDescription && "Missing Meta Description",
    !audit?.h1 && "Missing H1 Tag",
    loadTime > 3000 && `Critical Load Time (${loadTime}ms)`,
  ].filter(Boolean);

  const warnings = [
    missingAlts > 0 && `${missingAlts} Images Missing Alt Text`,
    audit?.h2s?.length === 0 && "No H2 Structure",
    (loadTime > 1000 && loadTime <= 3000) && `Slow Load Time (${loadTime}ms)`,
    (audit?.title?.length ?? 0) < 30 && "Title Tag too short",
  ].filter(Boolean);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-900/50 border-l border-slate-800 w-96 shrink-0 overflow-y-auto", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            SEO Analysis
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const printContent = `
                   <html>
                     <head>
                       <title>SEO Audit Report - ${audit?.url}</title>
                       <style>
                         body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; mx-auto; }
                         h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                         h2 { margin-top: 30px; color: #334155; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
                         .score-box { text-align: center; margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 10px; }
                         .score { font-size: 48px; font-weight: bold; }
                         .metric { margin-bottom: 10px; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; }
                         .value { font-weight: 600; }
                         .error { color: #e11d48; } .success { color: #059669; } .warning { color: #d97706; }
                         ul { padding-left: 20px; }
                         li { margin-bottom: 8px; color: #475569; }
                       </style>
                     </head>
                     <body>
                       <h1>SEO Technical Audit Report</h1>
                       <p><strong>Target URL:</strong> ${audit?.url}</p>
                       <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                       
                       <div class="score-box">
                         <div>Overall SEO Score</div>
                         <div class="score" style="color: ${isGood ? '#10b981' : isAvg ? '#f59e0b' : '#f43f5e'}">${score}/100</div>
                       </div>
                       
                       <h2>Technical Checks</h2>
                       <div class="metric">
                         <span>Title Tag</span>
                         <span class="value ${audit?.title ? 'success' : 'error'}">${audit?.title ? 'Optimized' : 'Missing'}</span>
                       </div>
                       <div class="metric">
                         <span>Meta Description</span>
                         <span class="value ${audit?.metaDescription ? 'success' : 'error'}">${audit?.metaDescription ? 'Present' : 'Missing'}</span>
                       </div>
                       <div class="metric">
                         <span>Performance (Load Time)</span>
                         <span class="value">${loadTime}ms</span>
                       </div>

                       <h2>Analysis & Recommendations</h2>
                       <ul>
                         ${audit?.recommendations?.map(r => `<li>${r}</li>`).join('') || '<li>No major issues found.</li>'}
                       </ul>
                       
                       <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8;">
                         Generated by Kola SEO
                       </div>
                     </body>
                   </html>
                 `;
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(printContent);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}
              title="Export Report"
              className="text-slate-500 hover:text-indigo-400 transition-colors mr-2 p-1 hover:bg-slate-800 rounded"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Toggle Panel"
            >
              <ChevronRight className={cn("w-5 h-5 transition-transform", isExpanded ? "rotate-90" : "")} />
            </button>
          </div>
        </div>

        {/* URL Info */}
        {audit && (
          <div className="p-3 mb-4 rounded-xl bg-slate-800/50 border border-slate-700/50 break-all">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Target URL</p>
            <a href={audit.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {new URL(audit.url).hostname}
            </a>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-slate-800/50 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
              activeTab === "overview" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("technical")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
              activeTab === "technical" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            Technical Audit
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Score Gauge */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * score) / 100} className={cn("transition-all duration-1000 ease-out", ringColor)} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-4xl font-bold tracking-tighter", scoreColor)}>
                    {isLoading ? "--" : score}
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <MetricItem
                  label="Title Tag"
                  value={audit?.title ? "Optimized" : "Missing"}
                  status={audit?.title ? "success" : "error"}
                  loading={isLoading}
                />
                <MetricItem
                  label="Meta Description"
                  value={audit?.metaDescription ? "Present" : "Missing"}
                  status={audit?.metaDescription ? "success" : "error"}
                  loading={isLoading}
                />
                <MetricItem
                  label="Performance"
                  value={performanceScore > 80 ? "Good" : performanceScore > 50 ? "Average" : "Poor"}
                  status={performanceScore > 80 ? "success" : performanceScore > 50 ? "warning" : "error"}
                  loading={isLoading}
                />
              </div>

              {/* Keyword Density */}
              {audit?.keywordDensity && (
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Keyword Density
                  </p>
                  <div className="space-y-2">
                    {Object.entries(audit.keywordDensity as Record<string, number>).slice(0, 5).map(([word, density]) => (
                      <KeywordBar key={word} word={word} count={0} percentage={density} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {isExpanded && activeTab === "technical" && (
            <motion.div
              key="technical"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Critical Errors */}
              <div>
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Critical Errors
                </h4>
                {criticalErrors.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No critical errors found.</p>
                ) : (
                  <div className="space-y-3">
                    {criticalErrors.map((error, i) => (
                      <div key={i} className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg">
                        <p className="text-sm text-rose-200 mb-2">{error}</p>
                        <button
                          onClick={() => copyToClipboard(`<meta name="description" content="Add your description here">`)}
                          className="text-xs bg-rose-900/50 hover:bg-rose-900 text-rose-100 px-2 py-1 rounded transition-colors"
                        >
                          Copy Fix
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warnings */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Warnings
                </h4>
                {warnings.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No warnings found.</p>
                ) : (
                  <div className="space-y-3">
                    {warnings.map((warning, i) => (
                      <div key={i} className="bg-amber-950/20 border border-amber-900/50 p-3 rounded-lg">
                        <p className="text-sm text-amber-200">{warning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical Stats */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <MetricItem label="Load Time" value={`${loadTime}ms`} status={loadTime < 1000 ? "success" : loadTime < 3000 ? "warning" : "error"} />
                <MetricItem label="Internal Links" value={links.filter((l: any) => l.type === 'internal').length.toString()} status="success" />
                <MetricItem label="External Links" value={links.filter((l: any) => l.type === 'external').length.toString()} status="success" />
                <MetricItem label="Images" value={`${images.length} (${missingAlts} no alt)`} status={missingAlts === 0 ? "success" : "warning"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricItem({ label, value, status, loading }: { label: string, value: string, status: "success" | "warning" | "error", loading?: boolean }) {
  if (loading) return <div className="h-10 bg-slate-800/50 rounded-lg animate-pulse" />;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn("text-xs font-medium",
          status === "success" ? "text-emerald-400" :
            status === "warning" ? "text-amber-400" : "text-rose-400"
        )}>
          {value}
        </span>
        {status === "success" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-500" />
        )}
      </div>
    </div>
  );
}

function KeywordBar({ word, count, percentage }: { word: string, count: number, percentage: number }) {
  return (
    <div className="group">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300 font-medium">{word}</span>
        <span className="text-slate-500">{count} ({percentage}%)</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ width: `${Math.min(percentage * 10, 100)}%` }}
        />
      </div>
    </div>
  );
}
