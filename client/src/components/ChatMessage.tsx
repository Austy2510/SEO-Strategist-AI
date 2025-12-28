import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 p-4 md:p-6 w-full max-w-4xl mx-auto group",
        isUser ? "flex-row-reverse bg-transparent" : "bg-card/30 rounded-2xl border border-white/5"
      )}
    >
      <div className={cn(
        "shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg",
        isUser ? "bg-indigo-600 text-white" : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
      )}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className={cn(
        "flex-1 min-w-0 space-y-2",
        isUser ? "text-right" : "text-left"
      )}>
        <div className="flex items-center gap-2 mb-1 opacity-70 text-xs uppercase tracking-wider font-semibold">
          {isUser ? "You" : "Senior SEO Strategist"}
          {!isUser && (
            <button 
              onClick={handleCopy}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
              title="Copy response"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        {isUser ? (
          <div className="bg-primary/20 text-primary-foreground/90 inline-block px-4 py-2 rounded-2xl rounded-tr-sm border border-primary/20 backdrop-blur-sm">
            {content}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm md:text-base leading-7">
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="relative group/code">
                      <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                         {/* Code copy functionality could go here */}
                      </div>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
