import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SEOScorePanel } from "@/components/SEOScorePanel";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Globe, Zap, LayoutTemplate, FileSearch } from "lucide-react";
import { useConversation, useChatStream } from "@/hooks/use-chats";
import { useCreateAudit } from "@/hooks/use-audits";
import { useRoute } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [match, params] = useRoute("/chat/:id");
  const conversationId = params?.id ? parseInt(params.id) : null;
  
  const { data: conversation, isLoading } = useConversation(conversationId);
  const { sendMessage, isStreaming, streamedContent } = useChatStream(conversationId);
  const { mutate: createAudit, isPending: isAuditing } = useCreateAudit();

  const [input, setInput] = useState("");
  const [currentAuditId, setCurrentAuditId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamedContent]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !conversationId) return;
    
    // Check if input looks like a URL for auto-auditing
    if (input.match(/^https?:\/\//)) {
      handleAudit(input);
    }
    
    sendMessage(input);
    setInput("");
  };

  const handleAudit = (url: string) => {
    createAudit({ url }, {
      onSuccess: (audit) => {
        setCurrentAuditId(audit.id);
        // Optionally notify chat context about the audit
      }
    });
  };

  const handleQuickAction = (action: string) => {
    const prompts = {
      competitor: "Analyze the top competitors for the keyword 'organic coffee beans' and suggest a content gap strategy.",
      cluster: "Generate a semantic topic cluster around 'technical SEO' including pillar pages and cluster content.",
      audit: "Please audit the following URL for technical SEO issues: ",
      meta: "Write optimized Title Tags and Meta Descriptions for a homepage about 'AI-powered gardening tools'."
    };
    
    const prompt = prompts[action as keyof typeof prompts];
    if (prompt) {
      if (action === 'audit') {
        setInput(prompt);
      } else {
        sendMessage(prompt);
      }
    }
  };

  if (!conversationId && !isLoading) {
    return (
      <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in">
           <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-4 border border-indigo-500/20 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
             <Globe className="w-12 h-12 text-indigo-400" />
           </div>
           <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
             AI SEO Strategist
           </h1>
           <p className="text-slate-400 max-w-md text-lg">
             Select a conversation from the sidebar or start a new audit to optimize your web presence.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950/50 backdrop-blur z-10">
          <h2 className="font-semibold text-slate-200 truncate">
            {conversation?.title || "New Session"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gemini 1.5 Pro Active</span>
          </div>
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {conversation?.messages?.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              role={msg.role as "user" | "assistant"} 
              content={msg.content} 
            />
          ))}
          
          {isStreaming && (
            <ChatMessage 
              role="assistant" 
              content={streamedContent} 
              isStreaming={true}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-20">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
              <Button variant="cyber" size="sm" onClick={() => handleQuickAction('competitor')}>
                <Zap className="mr-2 h-3.5 w-3.5" /> Analyze Competitor
              </Button>
              <Button variant="cyber" size="sm" onClick={() => handleQuickAction('cluster')}>
                <LayoutTemplate className="mr-2 h-3.5 w-3.5" /> Topic Cluster
              </Button>
              <Button variant="cyber" size="sm" onClick={() => handleQuickAction('audit')}>
                <FileSearch className="mr-2 h-3.5 w-3.5" /> Audit Page
              </Button>
              <Button variant="cyber" size="sm" onClick={() => handleQuickAction('meta')}>
                <Globe className="mr-2 h-3.5 w-3.5" /> Meta Tags
              </Button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl opacity-20 group-focus-within:opacity-40 transition-opacity blur-md -z-10"></div>
              <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-xl">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about SEO strategy or paste a URL to audit..."
                  className="border-none bg-transparent h-14 px-4 text-base focus-visible:ring-0 placeholder:text-slate-500"
                  disabled={isStreaming}
                />
                <div className="pr-2">
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() || isStreaming}
                    className={cn(
                      "h-10 w-10 rounded-lg transition-all",
                      input.trim() ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-slate-800 text-slate-500"
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </form>
            <p className="text-center text-xs text-slate-600">
              AI can make mistakes. Verify important SEO data.
            </p>
          </div>
        </div>
      </main>

      {/* Right Panel - SEO Score */}
      <div className="hidden lg:block h-full">
        <SEOScorePanel auditId={currentAuditId} />
      </div>
    </div>
  );
}
