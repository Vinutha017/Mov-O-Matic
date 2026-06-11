import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function StickyProfile() {
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { currentUser, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until component is mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }
  
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

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('StickyProfile: logout failed', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
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

      <Button
        variant="destructive"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="shadow-lg p-3 rounded-full transition-all duration-200 hover:scale-110"
        title="Log out"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
}