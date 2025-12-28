import { Link, useLocation } from "wouter";
import { useConversations, useCreateConversation } from "@/hooks/use-chats";
import { Button } from "./ui/button";
import { Plus, MessageSquare, Menu, LayoutDashboard, History, Settings, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { data: conversations, isLoading } = useConversations();
  const { mutate: createChat, isPending } = useCreateConversation();

  const handleNewChat = () => {
    createChat({ title: "New Strategy Session" }, {
      onSuccess: (chat) => {
        // In a real app we'd navigate here, but wouter navigate is separate
        window.location.href = `/chat/${chat.id}`;
      }
    });
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Search className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">SEO Strategist</h1>
        </div>
        
        <Button 
          onClick={handleNewChat} 
          disabled={isPending}
          className="w-full justify-start gap-2 shadow-lg shadow-indigo-500/10 bg-indigo-600 hover:bg-indigo-500 border-none"
        >
          <Plus size={18} />
          {isPending ? "Creating..." : "New Audit"}
        </Button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            Workspace
          </h3>
          <nav className="space-y-1">
            <Link href="/" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location === "/" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            )}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link href="/history" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location === "/history" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            )}>
              <History size={18} />
              Previous Audits
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-slate-600 animate-pulse">Loading history...</div>
            ) : conversations?.slice(0, 10).map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group relative overflow-hidden",
                location === `/chat/${chat.id}` 
                  ? "bg-slate-800 text-slate-100 border-l-2 border-indigo-500" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-300"
              )}>
                <MessageSquare size={16} className={cn(
                  "shrink-0 transition-colors",
                  location === `/chat/${chat.id}` ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-500"
                )} />
                <span className="truncate">{chat.title}</span>
              </Link>
            ))}
            {conversations?.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-600 italic">No history yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:block w-72 h-screen sticky top-0 shrink-0", className)}>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-slate-900 border-slate-800">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 bg-slate-950 border-r border-slate-800">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
