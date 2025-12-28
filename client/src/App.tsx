import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import KeywordCluster from "@/pages/KeywordCluster";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";

function ProtectedRoute({ component: Component, path }: { component: any, path: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route path="/chat/:id">
        {/* Handle params with protected route manually or use wrapper */}
        {(params) => {
          const { user, isLoading } = useAuth();
          if (isLoading) return null; // or loader
          if (!user) return <Redirect to="/login" />;
          return <Dashboard />;
        }}
      </Route>
      <ProtectedRoute path="/history" component={History} />
      <ProtectedRoute path="/keywords" component={KeywordCluster} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
