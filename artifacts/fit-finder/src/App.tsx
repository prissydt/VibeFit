import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import SavedLooks from "@/pages/SavedLooks";
import SavedLookDetail from "@/pages/SavedLookDetail";
import LooksPage from "@/pages/LooksPage";
import ProfilePage from "@/pages/ProfilePage";
import { CartProvider } from "@/context/CartContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/looks" component={LooksPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/saved" component={SavedLooks} />
      <Route path="/saved/:id" component={SavedLookDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <CartProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </CartProvider>
  );
}

export default App;
