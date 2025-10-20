import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function StickyProfile() {
  const { currentUser } = useAuth();
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