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
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Welcome = lazy(() => import("@/pages/welcome"));
const Budget = lazy(() => import("@/pages/budget"));
const Itineraries = lazy(() => import("@/pages/itineraries"));
const Itinerary = lazy(() => import("@/pages/itinerary"));
const AIRecommendations = lazy(() => import("@/pages/ai-recommendations"));
const TripWizard = lazy(() => import("@/pages/trip-wizard"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const Profile = lazy(() => import("@/pages/profile"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(190,24,93,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.12),_transparent_28%),linear-gradient(180deg,_#fff7f8,_#ffffff)]">
    <div className="glass-card rounded-3xl px-8 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-300 text-white shadow-lg shadow-rose-500/20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">PLANORA</p>
      <p className="mt-2 text-gray-600">Loading your travel workspace...</p>
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
        <Route path="/forgot-password">
          <PublicRoute>
            <ForgotPassword />
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
