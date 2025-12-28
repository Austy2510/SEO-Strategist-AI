import { useAudit } from "@/hooks/use-audits";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronRight, BarChart3, Globe, Hash } from "lucide-react";
import { useState } from "react";

interface SEOScorePanelProps {
  auditId?: number | null;
  className?: string;
}

export function SEOScorePanel({ auditId, className }: SEOScorePanelProps) {
  const { data: audit, isLoading } = useAudit(auditId);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!audit && !isLoading) return null;

  // Mock data if loading or just starting
  const score = audit?.score ?? 0;
  const isGood = score >= 80;
  const isAvg = score >= 50 && score < 80;
  
  const scoreColor = isGood ? "text-emerald-400" : isAvg ? "text-amber-400" : "text-rose-400";
  const ringColor = isGood ? "stroke-emerald-500" : isAvg ? "stroke-amber-500" : "stroke-rose-500";

  return (
    <div className={cn("flex flex-col h-full bg-slate-900/50 border-l border-slate-800 w-80 shrink-0 overflow-y-auto", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Live SEO Score
          </h3>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronRight className={cn("w-5 h-5 transition-transform", isExpanded ? "rotate-90" : "")} />
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Score Gauge */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * score) / 100}
                    className={cn("transition-all duration-1000 ease-out", ringColor)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-4xl font-bold tracking-tighter", scoreColor)}>
                    {isLoading ? "--" : score}
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>

              {/* URL Info */}
              {audit && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-start gap-3 mb-2">
                    <Globe className="w-4 h-4 text-slate-400 mt-1" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Target URL</p>
                      <p className="text-sm text-slate-200 truncate hover:text-clip hover:whitespace-normal break-all">
                        {audit.url}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  label="H1 Tag" 
                  value={audit?.h1 ? "Found" : "Missing"} 
                  status={audit?.h1 ? "success" : "error"}
                  loading={isLoading}
                />
                <div className="pt-2 border-t border-slate-800">
                   <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Hash className="w-3 h-3" /> Keyword Density
                   </p>
                   {/* In a real app, map through audit.keywordDensity */}
                   <div className="space-y-2">
                     {isLoading ? (
                       <div className="h-20 bg-slate-800/50 rounded-lg animate-pulse" />
                     ) : (
                       <>
                         <KeywordBar word="seo" count={12} percentage={2.4} />
                         <KeywordBar word="optimization" count={8} percentage={1.8} />
                         <KeywordBar word="strategy" count={5} percentage={1.1} />
                       </>
                     )}
                   </div>
                </div>
              </div>

              {/* Recommendations */}
              {audit?.recommendations && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                    Top Issues
                  </p>
                  <ul className="space-y-2">
                    {audit.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="text-xs text-slate-300 flex gap-2">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
