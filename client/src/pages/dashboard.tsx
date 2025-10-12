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
  Wallet,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    // Check if this is a new user welcome
    const urlParams = new URLSearchParams(window.location.search);
    const isWelcome = urlParams.get('welcome') === 'true';
    setShowWelcomeMessage(isWelcome);

    // Get user profile from localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const storedName = userProfile.firstName || userProfile.fullName?.split(' ')[0] || localStorage.getItem('userName') || 'Traveler';
    setUserName(storedName);

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Auto-hide welcome message after 5 seconds
    if (isWelcome) {
      const welcomeTimer = setTimeout(() => {
        setShowWelcomeMessage(false);
        // Clean up the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 5000);
      
      return () => {
        clearInterval(timer);
        clearTimeout(welcomeTimer);
      };
    }

    return () => clearInterval(timer);
  }, []);

  // Mock data for demo purposes
  const mockUserStats = {
    tripsPlanned: 3,
    tripsCompleted: 2,
    totalBudget: 50000,
    budgetUsed: 32000,
    favoriteDestinations: ['Goa', 'Kerala', 'Rajasthan'],
    nextTrip: {
      destination: 'Goa, India',
      date: '2024-12-15',
      daysLeft: 45,
      budget: 25000,
      progress: 85
    }
  };

  const mockRecentActivity = [
    {
      id: 1,
      type: 'trip_created',
      title: 'New trip to Kerala planned',
      description: 'Created detailed 7-day backwater itinerary',
      time: '2 hours ago',
      icon: Plane,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'budget_updated',
      title: 'Budget updated for Rajasthan trip',
      description: 'Added ₹5000 for activities',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      type: 'itinerary_saved',
      title: 'Saved Himachal itinerary',
      description: 'Bookmarked 5-day mountain adventure',
      time: '3 days ago',
      icon: Bookmark,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const mockUpcomingTrips = [
    {
      id: 1,
      destination: 'Goa, India',
      date: '2024-12-15',
      duration: '7 days',
      budget: 25000,
      status: 'planned',
      progress: 85,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      destination: 'Rajasthan, India',
      date: '2025-03-20',
      duration: '5 days',
      budget: 18000,
      status: 'in_progress',
      progress: 60,
      image: '/api/placeholder/300/200'
    }
  ];

  const quickActions = [
    {
      title: 'Plan Your India Trip',
      description: 'Discover India\'s diversity - from Himalayas to beaches, cities to villages',
      icon: Compass,
      href: '/trip-wizard',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    }
  ];

  const recentStats = [
    { 
      label: 'Trips Planned', 
      value: mockUserStats.tripsPlanned.toString(), 
      icon: MapPin,
      change: '+1 this month',
      changeType: 'positive'
    },
    { 
      label: 'Total Budget', 
      value: `₹${mockUserStats.totalBudget.toLocaleString()}`, 
      icon: TrendingUp,
      change: '+₹5000 added',
      changeType: 'positive'
    },
    { 
      label: 'Next Trip', 
      value: `${mockUserStats.nextTrip.daysLeft} days`, 
      icon: Calendar,
      change: 'Goa bound!',
      changeType: 'neutral'
    },
    { 
      label: 'Budget Used', 
      value: `${Math.round((mockUserStats.budgetUsed / mockUserStats.totalBudget) * 100)}%`, 
      icon: Wallet,
      change: 'On track',
      changeType: 'positive'
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce opacity-30">
          <Plane className="w-8 h-8 text-blue-400 transform rotate-45" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse opacity-20">
          <Globe className="w-12 h-12 text-purple-400" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-bounce opacity-25">
          <MapPin className="w-6 h-6 text-green-400" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
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
                <div className="hidden md:block text-sm text-gray-500">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message Banner */}
          {showWelcomeMessage && (
            <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in-down">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Welcome to Mov-O-Matic! �🇳</h3>
                    <p className="text-green-100 text-sm">Discover the magic of India - use our Trip Wizard to plan your perfect Indian adventure!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcomeMessage(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {userName}! ✨
                </h1>
                <p className="text-gray-600">
                  Ready to explore incredible India? Use our Trip Wizard to plan your perfect Indian adventure.
                </p>
              </div>
              <Link href="/trip-wizard">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Trip Wizard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {recentStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-xs mt-1 ${
                          stat.changeType === 'positive' ? 'text-green-600' : 
                          stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Trip Wizard Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Incredible India</h2>
            <div className="max-w-2xl mx-auto">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <Card className={`bg-gradient-to-br ${action.bgGradient} border-white/50 hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                      <CardContent className="p-12 text-center">
                        <div className={`w-20 h-20 bg-gradient-to-r ${action.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{action.title}</h3>
                        <p className="text-gray-600 mb-6 text-lg">{action.description}</p>
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg transition-all duration-300">
                          Start India Trip Wizard
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Trips */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>Upcoming Trips</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockUpcomingTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{trip.destination}</h3>
                        <p className="text-sm text-gray-600">{trip.date} • {trip.duration}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Progress value={trip.progress} className="flex-1" />
                          <span className="text-xs text-gray-500">{trip.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{trip.budget.toLocaleString()}</p>
                        <Badge variant={trip.status === 'planned' ? 'default' : 'secondary'} className="mt-1">
                          {trip.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {mockUpcomingTrips.length === 0 && (
                    <div className="text-center py-12">
                      <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No upcoming trips</p>
                      <p className="text-gray-400 text-sm">Start planning your next adventure!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="bg-white/80 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Button variant="ghost" className="w-full mt-4">
                    View All Activity
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Next Trip Countdown */}
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mt-6">
                <CardContent className="p-6 text-center">
                  <Plane className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Next Adventure</h3>
                  <p className="text-blue-100 mb-2">{mockUserStats.nextTrip.destination}</p>
                  <div className="text-3xl font-bold mb-2">{mockUserStats.nextTrip.daysLeft}</div>
                  <p className="text-blue-100">days to go!</p>
                  <Button variant="secondary" size="sm" className="mt-4">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-10px) rotate(45deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}