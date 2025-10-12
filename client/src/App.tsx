import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Welcome from "@/pages/welcome";
import Budget from "@/pages/budget";
import Itineraries from "@/pages/itineraries";
import Itinerary from "@/pages/itinerary";
import AIRecommendations from "@/pages/ai-recommendations";
import TripWizard from "@/pages/trip-wizard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/trip-wizard" component={TripWizard} />
      <Route path="/budget" component={Budget} />
      <Route path="/itineraries" component={Itineraries} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/ai-recommendations" component={AIRecommendations} />
      <Route path="/trip/:id" component={Itinerary} />
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
