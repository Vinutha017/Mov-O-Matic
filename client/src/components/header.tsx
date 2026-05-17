import { Button } from "@/components/ui/button";
import { Route, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import NotificationBell from "@/components/notification-bell";

export default function Header() {
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-rose-100/70 sticky top-0 z-50 transition-all duration-300">
      <div className="travel-container">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 via-pink-400 to-rose-200 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Route className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-700 to-pink-500 bg-clip-text text-transparent">
              Planora
            </span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-rose-600 font-medium">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 font-medium">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}