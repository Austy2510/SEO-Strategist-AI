import { Sidebar } from "@/components/Sidebar";
import { useAudits } from "@/hooks/use-audits";
import { format } from "date-fns";
import { Search, ExternalLink, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  const { data: audits, isLoading } = useAudits();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Audit History</h1>
            <p className="text-slate-400">Review past technical SEO audits and performance tracking.</p>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audits?.map((audit, i) => (
                <motion.div
                  key={audit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-lg border border-slate-700 group-hover:bg-slate-800 group-hover:border-indigo-500/50 transition-colors">
                      <span className={audit.score >= 80 ? "text-emerald-400" : audit.score >= 50 ? "text-amber-400" : "text-rose-400"}>
                        {audit.score}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {audit.createdAt ? format(new Date(audit.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-slate-200 mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {audit.title || "Untitled Audit"}
                  </h3>
                  
                  <a 
                    href={audit.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-slate-500 mb-6 hover:text-indigo-400 transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span className="truncate">{audit.url}</span>
                  </a>

                  <div className="space-y-2">
                    {audit.recommendations?.slice(0, 2).map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                        <span className="line-clamp-2">{rec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                    <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/btn">
                      View Report <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {audits?.length === 0 && (
             <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
               <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
               <h3 className="text-xl font-medium text-slate-300">No audits yet</h3>
               <p className="text-slate-500 mt-2">Start a conversation to generate your first technical SEO audit.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
