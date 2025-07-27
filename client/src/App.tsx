import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import CustomerApp from "@/pages/CustomerApp";
import MerchantDashboard from "@/pages/MerchantDashboard";
import AdminPanel from "@/pages/AdminPanel";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/customer" component={Landing} />
          <Route path="/merchant" component={Landing} />
          <Route path="/admin" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={() => {
            if (user?.role === 'customer') return <CustomerApp />;
            if (user?.role === 'merchant') return <MerchantDashboard />;
            if (user?.role === 'admin') return <AdminPanel />;
            return <CustomerApp />;
          }} />
          <Route path="/customer" component={CustomerApp} />
          <Route path="/merchant" component={MerchantDashboard} />
          <Route path="/admin" component={AdminPanel} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
