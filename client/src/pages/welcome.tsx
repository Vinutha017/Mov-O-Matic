import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Compass, Home, Sparkles, Map, Heart } from 'lucide-react';

export default function Welcome() {
  const [, setLocation] = useLocation();

  // Get user's data from localStorage
  const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const userName = userData.firstName || userData.fullName?.split(' ')[0] || 'Traveler';
  const isNewUser = userData.isNewUser === true;

  const handleStartPlanning = () => {
    // Mark user as no longer new after they start planning
    if (isNewUser) {
      const updatedUserData = { ...userData, isNewUser: false };
      localStorage.setItem('userProfile', JSON.stringify(updatedUserData));
    }
    setLocation('/trip-wizard');
  };

  const handleGoToDashboard = () => {
    // Mark user as no longer new
    if (isNewUser) {
      const updatedUserData = { ...userData, isNewUser: false };
      localStorage.setItem('userProfile', JSON.stringify(updatedUserData));
    }
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100/70 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-rose-300 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-rose-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-rose-200 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-rose-200 rounded-full animate-bounce opacity-30"></div>
        
        {/* Floating Travel Icons */}
        <div className="absolute top-1/4 left-1/4 animate-float opacity-20">
          <Map className="w-8 h-8 text-rose-400" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-delayed opacity-20">
          <Compass className="w-6 h-6 text-rose-500" />
        </div>
      </div>

      <Card className="max-w-2xl w-full p-8 md:p-12 shadow-2xl border border-rose-100 bg-white/88 backdrop-blur-sm relative overflow-hidden">
        {/* Success Celebration */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-rose-300 to-rose-200 rounded-full mb-6 shadow-md shadow-rose-200/50">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-800 to-rose-500 bg-clip-text text-transparent mb-4">
            {isNewUser ? `🎉 Welcome, ${userName}!` : `👋 Welcome Back, ${userName}!`}
          </h1>
          
          <p className="text-xl text-gray-600 mb-2 font-medium">
            {isNewUser 
              ? "Your profile is ready and you're all set!" 
              : "Ready to continue your travel journey?"
            }
          </p>
          
          <p className="text-lg text-gray-500">
            {isNewUser
              ? "Would you like to start planning your first trip now or explore your dashboard first?"
              : "Choose to plan a new trip or check your existing travel plans"
            }
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {/* Start Planning Trip */}
          <Card 
            className="p-6 border-2 border-rose-100 hover:border-rose-300 transition-all duration-300 cursor-pointer group hover:shadow-lg bg-gradient-to-br from-rose-50 to-white"
            onClick={handleStartPlanning}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-400 to-rose-300 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Compass className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-rose-900 mb-2">
                {isNewUser ? "Start Planning My First Trip" : "Plan a New Trip"}
              </h3>
              
              <p className="text-rose-700 text-sm mb-4">
                {isNewUser 
                  ? "Let's create your perfect itinerary with AI-powered recommendations"
                  : "Ready for your next adventure? Let's plan something amazing!"
                }
              </p>
              
              <Button 
                onClick={handleStartPlanning}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isNewUser ? "🧭 Start Planning Now" : "✈️ Plan New Trip"}
              </Button>
            </div>
          </Card>

          {/* Go to Dashboard */}
          <Card 
            className="p-6 border-2 border-rose-100 hover:border-rose-300 transition-all duration-300 cursor-pointer group hover:shadow-lg bg-gradient-to-br from-white to-rose-50"
            onClick={handleGoToDashboard}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Home className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-rose-900 mb-2">
                {isNewUser ? "Explore My Dashboard" : "View My Dashboard"}
              </h3>
              
              <p className="text-rose-700 text-sm mb-4">
                {isNewUser
                  ? "Explore your personal travel hub and see what's possible"
                  : "Check your saved trips, favorites, and travel statistics"
                }
              </p>
              
              <Button 
                onClick={handleGoToDashboard}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isNewUser ? "🏠 Explore Dashboard" : "📊 View Dashboard"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 pt-6 border-t border-rose-100">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Your journey to amazing travels starts here!
          </p>
        </div>
      </Card>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
}