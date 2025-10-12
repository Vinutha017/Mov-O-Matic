import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Compass, 
  DollarSign, 
  Clock, 
  User, 
  Settings, 
  LogOut,
  Plane,
  MapPin,
  TrendingUp,
  Calendar,
  Star,
  Heart,
  Camera,
  Globe,
  Bell,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Users,
  Target,
  Wallet
} from 'lucide-react';

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Get user profile from localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const storedName = userProfile.firstName || localStorage.getItem('userName') || 'Traveler';
    setUserName(storedName);

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const quickActions = [
    {
      id: 'plan-trip',
      title: 'Start Planning a Trip',
      description: 'Create your perfect travel itinerary with AI assistance',
      icon: Compass,
      href: '/trip-wizard',
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'track-budget',
      title: 'Track My Budget',
      description: 'Monitor your travel expenses and stay within budget',
      icon: DollarSign,
      href: '/budget',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'saved-itineraries',
      title: 'View Saved Itineraries',
      description: 'Access your previously created travel plans',
      icon: Clock,
      href: '/itineraries',
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  // Mock data for demo purposes
  const mockUserStats = {
    tripsPlanned: 3,
    tripsCompleted: 2,
    totalBudget: 5000,
    budgetUsed: 3200,
    favoriteDestinations: ['Tokyo', 'Paris', 'New York'],
    nextTrip: {
      destination: 'Tokyo, Japan',
      date: '2024-12-15',
      daysLeft: 45,
      budget: 2500,
      progress: 85
    }
  };

  const mockRecentActivity = [
    {
      id: 1,
      type: 'trip_created',
      title: 'New trip to Tokyo planned',
      time: '2 hours ago',
      icon: Plane,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'budget_updated',
      title: 'Budget updated for Paris trip',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'itinerary_saved',
      title: 'Saved New York itinerary',
      time: '3 days ago',
      icon: Bookmark,
      color: 'text-purple-600'
    }
  ];

  const mockUpcomingTrips = [
    {
      id: 1,
      destination: 'Tokyo, Japan',
      date: '2024-12-15',
      duration: '7 days',
      budget: 2500,
      status: 'planned',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=200&fit=crop'
    },
    {
      id: 2,
      destination: 'Paris, France',
      date: '2025-03-20',
      duration: '5 days',
      budget: 1800,
      status: 'in_progress',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=200&fit=crop'
    }
  ];

  const recentStats = [
    { label: 'Trips Planned', value: mockUserStats.tripsPlanned, icon: MapPin },
    { label: 'Total Budget', value: `$${mockUserStats.totalBudget.toLocaleString()}`, icon: TrendingUp },
    { label: 'Next Trip', value: `${mockUserStats.nextTrip.daysLeft} days`, icon: Calendar },
    { label: 'Budget Used', value: `${Math.round((mockUserStats.budgetUsed / mockUserStats.totalBudget) * 100)}%`, icon: Wallet }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Plane Animation */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <Plane className="w-8 h-8 text-blue-300 transform rotate-45" />
        </div>
        <div className="absolute top-40 right-20 animate-float-slower">
          <Plane className="w-6 h-6 text-purple-300 transform rotate-12" />
        </div>
        
        {/* Floating Map Pins */}
        <div className="absolute bottom-32 left-20 animate-bounce-slow">
          <MapPin className="w-6 h-6 text-green-300" />
        </div>
        <div className="absolute top-60 right-40 animate-bounce-slower">
          <MapPin className="w-5 h-5 text-red-300" />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-2xl opacity-20 animate-pulse-slower"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Mov-O-Matic
                  </span>
                </div>
                <div className="hidden sm:block text-sm text-gray-500">
                  {formatTime(currentTime)}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {userName}! ✈️
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ready for your next adventure? Let's make your travel dreams come true.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {recentStats.map((stat, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <stat.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              What would you like to do today?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                <Link key={action.id} href={action.href}>
                  <Card className={`bg-gradient-to-br ${action.bgGradient} border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group h-full`}>
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 ${action.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-gray-600 text-base mb-6">
                        {action.description}
                      </CardDescription>
                      <Button 
                        className={`w-full bg-gradient-to-r ${action.gradient} hover:opacity-90 text-white font-medium transition-all duration-300 group-hover:shadow-lg`}
                        size="lg"
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Recent Activity</CardTitle>
              <CardDescription>Your latest travel planning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Compass className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Created Tokyo Adventure itinerary</p>
                    <p className="text-sm text-gray-600">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Updated budget for Paris trip</p>
                    <p className="text-sm text-gray-600">1 week ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Saved 5 new places to visit</p>
                    <p className="text-sm text-gray-600">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          
          @keyframes float-slower {
            0%, 100% { transform: translateY(0px) rotate(12deg); }
            50% { transform: translateY(-15px) rotate(12deg); }
          }
          
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes bounce-slower {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.1; }
          }
          
          @keyframes pulse-slower {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.05; }
          }
          
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          
          .animate-float-slower {
            animation: float-slower 8s ease-in-out infinite;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 4s ease-in-out infinite;
          }
          
          .animate-bounce-slower {
            animation: bounce-slower 5s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
          
          .animate-pulse-slower {
            animation: pulse-slower 6s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
}