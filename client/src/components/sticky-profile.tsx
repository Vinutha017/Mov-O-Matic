import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function StickyProfile() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until component is mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  let currentUser = null;
  try {
    const authData = useAuth();
    currentUser = authData.currentUser;
  } catch (error) {
    // If AuthProvider is not available, don't render
    console.warn('StickyProfile: AuthProvider not available');
    return null;
  }

  const [location] = useLocation();
  
  // Don't show on login/signup pages, home page, or the profile page itself
  // Note: use startsWith for profile so any /profile/* route also hides it
  if (
    location === '/' ||
    location.startsWith('/login') ||
    location.startsWith('/signup') ||
    location.startsWith('/profile')
  ) {
    return null;
  }

  // Only show if user is authenticated
  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[60]">
      <Link href="/profile">
        <Button 
          variant="default" 
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg p-3 rounded-full transition-all duration-200 hover:scale-110"
          title="Profile"
        >
          <User className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  );
}