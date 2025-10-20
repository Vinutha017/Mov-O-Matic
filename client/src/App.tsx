import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import HomeWithRedirect from "@/components/HomeWithRedirect";
import StickyProfile from "@/components/sticky-profile";
import { Suspense, lazy } from "react";
// Lazy load components for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Welcome = lazy(() => import("@/pages/welcome"));
const Budget = lazy(() => import("@/pages/budget"));
const Itineraries = lazy(() => import("@/pages/itineraries"));
const Itinerary = lazy(() => import("@/pages/itinerary"));
const AIRecommendations = lazy(() => import("@/pages/ai-recommendations"));
const TripWizard = lazy(() => import("@/pages/trip-wizard"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const Profile = lazy(() => import("@/pages/profile"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomeWithRedirect} />
        <Route path="/login">
          <PublicRoute>
            <Login />
          </PublicRoute>
        </Route>
        <Route path="/signup">
          <PublicRoute>
            <Signup />
          </PublicRoute>
        </Route>
        <Route path="/welcome">
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/trip-wizard">
          <ProtectedRoute>
            <TripWizard />
          </ProtectedRoute>
        </Route>
        <Route path="/budget">
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        </Route>
        <Route path="/itineraries">
          <ProtectedRoute>
            <Itineraries />
          </ProtectedRoute>
        </Route>
        <Route path="/ai-recommendations">
          <ProtectedRoute>
            <AIRecommendations />
          </ProtectedRoute>
        </Route>
        <Route path="/trip/:id">
          <ProtectedRoute>
            <Itinerary />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <StickyProfile />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
