import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { getUserTrips } from '../lib/firebaseService';
import Header from '../components/header';
import { 
  Plus,
  MapPin,
  Calendar,
  User,
  Settings,
  LogOut,
  Plane,
  Compass,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser, userProfile, logout, refreshUserProfile } = useAuth();
  const userName = userProfile?.displayName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Traveler';
  const [tripsPlanned, setTripsPlanned] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [profileStatus, setProfileStatus] = useState('Incomplete');

  // Debug function to check user data
  const debugUserData = () => {
    console.log('=== DEBUG USER DATA ===');
    console.log('🔍 Current User:', currentUser);
    console.log('📋 User Profile:', userProfile);
    console.log('🔑 User UID:', currentUser?.uid);
    console.log('📧 User Email:', currentUser?.email);
    console.log('========================');
  };

  // Fetch user's trip statistics
  useEffect(() => {
    const fetchTripStats = async () => {
      if (!currentUser?.uid) {
        console.log('❌ No authenticated user found in dashboard');
        setLoadingStats(false);
        return;
      }

      try {
        console.log('🔍 Dashboard: Fetching trips for user:', currentUser.uid);
        console.log('👤 Current user details:', {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        });
        setLoadingStats(true);
        
        // Get user's trips from Firebase
        const userTrips = await getUserTrips(currentUser.uid);
        console.log('📊 Dashboard: Retrieved trips:', userTrips.length, 'trips');
        console.log('📋 Trip details:', userTrips);
        
        setTripsPlanned(userTrips.length);
        
        // Debug userProfile data
        console.log('🔍 Dashboard: User profile data:', userProfile);
        console.log('📋 Profile fields check:', {
          displayName: userProfile?.displayName,
          city: userProfile?.city,
          country: userProfile?.country,
          phoneNumber: userProfile?.phoneNumber
        });
        
        // Check profile completeness
        const profileComplete = !!
          (userProfile?.displayName && 
           userProfile?.city && 
           userProfile?.country && 
           userProfile?.phoneNumber);
        
        console.log('✅ Profile complete status:', profileComplete);
        
        setProfileStatus(profileComplete ? 'Complete' : 'Incomplete');
        
      } catch (error) {
        console.error('❌ Error fetching trip stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchTripStats();
  }, [currentUser?.uid, userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to plan your next adventure? Let's get started!
          </p>
          
          {/* Debug button - remove in production */}
          <Button 
            onClick={debugUserData} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Debug User Data 🔍
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Start Trip Planning */}
          <Link href="/trip-wizard">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Plan New Trip</h3>
                <p className="text-gray-600 mb-4">Start planning your perfect travel adventure</p>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Profile */}
          <Link href="/profile">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">My Profile</h3>
                <p className="text-gray-600 mb-4">Manage your account and preferences</p>
                <Button variant="outline" className="w-full">
                  View Profile
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>


        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Getting Started</span>
                </CardTitle>
                <CardDescription>
                  Here are some steps to help you begin your travel planning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Complete your profile</h4>
                      <p className="text-gray-600 text-sm">Add your travel preferences and personal information</p>
                      <Link href="/profile">
                        <Button variant="link" className="p-0 h-auto text-blue-600">
                          Go to Profile →
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Plan your first trip</h4>
                      <p className="text-gray-600 text-sm">Use our Trip Wizard to create a personalized itinerary</p>
                      <Link href="/trip-wizard">
                        <Button variant="link" className="p-0 h-auto text-green-600">
                          Start Planning →
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Manage Your Profile</h4>
                      <p className="text-gray-600 text-sm">Update your travel preferences and personal information</p>
                      <Link href="/profile">
                        <Button variant="link" className="p-0 h-auto text-purple-600">
                          Go to Profile →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-purple-600" />
                  <span>Your Journey</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600 text-sm">Loading...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Trips Planned</span>
                      <span className="font-semibold text-gray-900">{tripsPlanned}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Profile Status</span>
                      <span className={`font-semibold ${
                        profileStatus === 'Complete' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {profileStatus}
                      </span>
                    </div>
                    {currentUser && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          User: {currentUser.email}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <Compass className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-lg font-semibold mb-2">Ready to Explore?</h3>
                <p className="text-blue-100 mb-4 text-sm">Start your travel planning journey today</p>
                <Link href="/trip-wizard">
                  <Button variant="secondary" size="sm" className="w-full">
                    Plan Your Trip
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}