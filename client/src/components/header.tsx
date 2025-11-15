import { Button } from "@/components/ui/button";
import { Route, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="travel-container">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Route className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Move-O-Matic
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-medium">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 font-medium">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}