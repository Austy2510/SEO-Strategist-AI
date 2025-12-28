import { Link, useLocation } from "wouter";
import { useConversations, useCreateConversation } from "@/hooks/use-chats";
import { Button } from "./ui/button";
import { Plus, MessageSquare, Menu, LayoutDashboard, History, Settings, X, Search, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "./ui/separator";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { data: conversations, isLoading } = useConversations();
  const { mutate: createChat, isPending } = useCreateConversation();
  const { user, logoutMutation } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNewChat = () => {
    createChat({ title: "New Strategy Session" }, {
      onSuccess: (chat) => {
        window.location.href = `/chat/${chat.id}`;
      }
    });
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      {/* Header */}
      <div className={cn("flex items-center gap-3 p-4", isCollapsed ? "justify-center" : "px-6 py-6")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <Search className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && <h1 className="font-bold text-lg tracking-tight">SEO Strategist</h1>}
      </div>

      <div className="px-4 mb-4">
        <Button
          onClick={handleNewChat}
          disabled={isPending}
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "shadow-lg shadow-indigo-500/10 bg-indigo-600 hover:bg-indigo-500 border-none",
            isCollapsed ? "w-10 h-10 rounded-lg" : "w-full justify-start gap-2"
          )}
        >
          <Plus size={18} />
          {!isCollapsed && (isPending ? "Creating..." : "New Audit")}
        </Button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-none">
        <div>
          {!isCollapsed && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Workspace</h3>}
          <nav className="space-y-1">
            <Link href="/dashboard" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location === "/dashboard" || location.startsWith("/chat/") ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
              isCollapsed && "justify-center px-2"
            )}>
              <LayoutDashboard size={18} />
              {!isCollapsed && "Dashboard"}
            </Link>
            <Link href="/keywords" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location === "/keywords" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
              isCollapsed && "justify-center px-2"
            )}>
              <Settings size={18} />
              {!isCollapsed && "Keyword Map"}
            </Link>
            <Link href="/analytics" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location === "/analytics" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
              isCollapsed && "justify-center px-2"
            )}>
              <MessageSquare size={18} />
              {!isCollapsed && "Analytics"}
            </Link>
            <Link href="/history" className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location === "/history" ? "bg-slate-800 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
              isCollapsed && "justify-center px-2"
            )}>
              <History size={18} />
              {!isCollapsed && "Previous Audits"}
            </Link>
          </nav>
        </div>

        <div>
          {!isCollapsed && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Recently</h3>}
          <div className="space-y-1">
            {isLoading ? (
              !isCollapsed && <div className="px-3 py-2 text-sm text-slate-600 animate-pulse">Loading...</div>
            ) : conversations?.slice(0, 5).map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group relative overflow-hidden",
                location === `/chat/${chat.id}` ? "bg-slate-800 text-slate-100 border-l-2 border-indigo-500" : "text-slate-400 hover:bg-slate-900 hover:text-slate-300",
                isCollapsed && "justify-center px-2"
              )}>
                <MessageSquare size={16} className={cn(
                  "shrink-0 transition-colors",
                  location === `/chat/${chat.id}` ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-500"
                )} />
                {!isCollapsed && <span className="truncate">{chat.title}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User & Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        {!isCollapsed && user && (
          <div className="mb-4 bg-slate-900 rounded-lg p-3 border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2 text-slate-400">
              <span>Daily Scans</span>
              <span className={cn(user.scansToday >= 5 ? "text-rose-400 font-bold" : "text-emerald-400")}>
                {user.scansToday}/5
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", user.scansToday >= 5 ? "bg-rose-500" : "bg-emerald-500")}
                style={{ width: `${Math.min((user.scansToday / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className={cn("flex items-center gap-3", isCollapsed ? "flex-col" : "justify-between")}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 shrink-0">
              <User size={16} />
            </div>
            {!isCollapsed && user && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-200 truncate">{user.username}</span>
                <span className="text-xs text-slate-500">Free Plan</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
            onClick={() => logoutMutation.mutate()}
            title="Logout"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="hidden md:flex justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-slate-600 hover:text-slate-400"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:block h-screen sticky top-0 shrink-0 transition-all duration-300", isCollapsed ? "w-20" : "w-72", className)}>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-slate-900/50 backdrop-blur border border-slate-800">
              <Menu className="w-5 h-5 text-slate-200" />
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
