import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SEOScorePanel } from "@/components/SEOScorePanel";
import { ChatMessage } from "@/components/ChatMessage";
import { DashboardWidgets } from "@/components/DashboardWidgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists
import { Send, Globe, Zap, LayoutTemplate, FileSearch, X, PieChart } from "lucide-react";
import { useConversation, useChatStream, useCreateConversation } from "@/hooks/use-chats";
import { useCreateAudit } from "@/hooks/use-audits";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [match, params] = useRoute("/chat/:id");
  const [, setLocation] = useLocation();
  const conversationId = params?.id ? parseInt(params.id) : null;

  const { data: conversation, isLoading } = useConversation(conversationId);
  const { mutate: createChat, isPending: isCreatingChat } = useCreateConversation();
  const { sendMessage, isStreaming, streamedContent } = useChatStream(conversationId);
  const { mutate: createAudit, isPending: isAuditing } = useCreateAudit();

  const [input, setInput] = useState("");
  const [currentAuditId, setCurrentAuditId] = useState<number | null>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamedContent]);

  const handleNewAudit = () => {
    createChat({ title: "New Audit Session" }, {
      onSuccess: (chat) => {
        setLocation(`/chat/${chat.id}`);
      }
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !conversationId) return;

    // Check if input looks like a URL for auto-auditing
    if (input.match(/^https?:\/\//)) {
      handleAudit(input);
    } else {
      sendMessage(input);
    }
    setInput("");
  };

  const handleAudit = (url: string) => {
    createAudit({ url }, {
      onSuccess: (audit) => {
        setCurrentAuditId(audit.id);
        setShowMobilePanel(true); // Open panel on success
      },
      onError: (error: any) => {
        // Check for bot protection code from server
        // Error object structure depends on how useCreateAudit handles it. Usually axios error.
        const msg = error.response?.data?.message || error.message;
        const code = error.response?.data?.code;

        if (code === 'BOT_PROTECTION_DETECTED') {
          setShowManualInput(true);
        } else {
          // Simple alert for now, could use toast
          alert("Audit failed: " + msg);
        }
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
      <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Command Center</h1>
              <p className="text-slate-400">Welcome back! Here is your SEO performance at a glance.</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleNewAudit}
                disabled={isCreatingChat}
                variant="outline"
                className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <FileSearch className="w-4 h-4 mr-2" />
                {isCreatingChat ? "Creating..." : "New Audit"}
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Zap className="w-4 h-4 mr-2" /> Quick Scan
              </Button>
            </div>
          </header>
          <DashboardWidgets />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      <Sidebar />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0">

        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950/50 backdrop-blur z-10">
          <h2 className="font-semibold text-slate-200 truncate">
            {conversation?.title || "New Session"}
          </h2>
          <div className="flex items-center gap-2">
            {/* Mobile Panel Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobilePanel(!showMobilePanel)}
            >
              <PieChart className="w-5 h-5 text-indigo-400" />
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gemini 1.5 Pro Active</span>
            </div>
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
                {/* Send Button ... */}
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
          </div>
        </div>
      </main>

      {/* Desktop Panel */}
      <div className="hidden lg:block h-full border-l border-slate-800">
        <SEOScorePanel auditId={currentAuditId} />
      </div>

      {/* Mobile Panel (Bottom Sheet) */}
      <AnimatePresence>
        {showMobilePanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 z-30 lg:hidden"
              onClick={() => setShowMobilePanel(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute bottom-0 left-0 right-0 h-[80vh] bg-slate-900 z-40 rounded-t-2xl shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-center p-2">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
              </div>
              <div className="flex-1 overflow-hidden relative">
                <SEOScorePanel auditId={currentAuditId} className="w-full bg-transparent border-0" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manual Input Dialog */}
      {showManualInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">Bot Protection Detected</h3>
              <button onClick={() => setShowManualInput(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-slate-400 text-sm">
              We couldn't crawl this site due to bot protection. Please copy the HTML source code (Right Click -&gt; View Page Source) and paste it here.
            </p>
            <Textarea
              placeholder="Paste HTML here..."
              className="min-h-[200px] bg-slate-950 border-slate-800 font-mono text-xs"
              onChange={(e) => {
                // In real app, we'd handle this HTML submission.
                // For now, we'll suggest pasting it into the chat instead or implement a separate handler.
                // For this step, I'll just auto-dismiss and fill chat input or simulating success.
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowManualInput(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowManualInput(false);
                sendMessage("I have the HTML source, can I paste it for analysis?");
              }}>Use HTML</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
