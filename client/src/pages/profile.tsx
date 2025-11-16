import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit, 
  Save, 
  X,
  ArrowLeft,
  Shield,
  Globe,
  Bell,
  Plane,
  TrendingUp
} from "lucide-react";

import { updateUserProfile, getUserTrips, createTrip } from "@/lib/firebaseService";

interface JourneyStats {
  tripsPlanned: number;
  destinationsExplored: number;
  profileStatus: 'Complete' | 'Incomplete';
}

export default function Profile() {
  const { currentUser, userProfile, logout, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [journeyStats, setJourneyStats] = useState<JourneyStats>({
    tripsPlanned: 0,
    destinationsExplored: 0,
    profileStatus: 'Incomplete'
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [editData, setEditData] = useState({
    displayName: "",
    phoneNumber: "",
    city: "",
    country: ""
  });

  useEffect(() => {
    if (userProfile) {
      setEditData({
        displayName: userProfile.displayName || "",
        phoneNumber: userProfile.phoneNumber || "",
        city: userProfile.city || "",
        country: userProfile.country || ""
      });
    }
  }, [userProfile]);

  // Fetch journey statistics
  useEffect(() => {
    const fetchJourneyStats = async () => {
      if (!currentUser?.uid) {
        console.log('❌ No current user found');
        setLoadingStats(false);
        return;
      }

      try {
        console.log('🔍 Fetching journey stats for user:', currentUser.uid);
        setLoadingStats(true);
        const userTrips = await getUserTrips(currentUser.uid);
        console.log('📊 Retrieved trips:', userTrips);
        
        // Calculate unique destinations
        const uniqueDestinations = new Set(
          userTrips.map(trip => trip.destination).filter(dest => dest)
        ).size;
        console.log('🌍 Unique destinations:', uniqueDestinations);

        // Debug userProfile data
        console.log('🔍 Profile: User profile data:', userProfile);
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
        console.log('✅ Profile complete:', profileComplete);

        const stats: JourneyStats = {
          tripsPlanned: userTrips.length,
          destinationsExplored: uniqueDestinations,
          profileStatus: profileComplete ? 'Complete' : 'Incomplete'
        };
        console.log('📈 Setting journey stats:', stats);

        setJourneyStats(stats);
      } catch (error) {
        console.error('❌ Error fetching journey stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchJourneyStats();
  }, [currentUser?.uid, userProfile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setEditData({
        displayName: userProfile.displayName || "",
        phoneNumber: userProfile.phoneNumber || "",
        city: userProfile.city || "",
        country: userProfile.country || ""
      });
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      await updateUserProfile(currentUser.uid, {
        displayName: editData.displayName,
        phoneNumber: editData.phoneNumber,
        city: editData.city,
        country: editData.country
      });
      
      // Refresh the user profile in the context
      await refreshUserProfile();
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      
      // Refresh journey stats to update profile status
      const profileComplete = !!
        (editData.displayName && 
         editData.city && 
         editData.country && 
         editData.phoneNumber);
      
      setJourneyStats(prev => ({
        ...prev,
        profileStatus: profileComplete ? 'Complete' : 'Incomplete'
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Test function to create sample trips
  const createSampleTrips = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create sample trips.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🧪 Creating sample trips...');
      
      const sampleTrips = [
        {
          userId: currentUser.uid,
          title: "Mumbai Adventure",
          destination: "Mumbai, Maharashtra",
          startDate: new Date(2025, 0, 15),
          endDate: new Date(2025, 0, 18),
          budget: 25000,
          currency: "INR",
          travelers: 2,
          tripType: "cultural" as const,
          status: "completed" as const
        },
        {
          userId: currentUser.uid,
          title: "Goa Beach Getaway",
          destination: "Goa, India",
          startDate: new Date(2025, 1, 10),
          endDate: new Date(2025, 1, 15),
          budget: 35000,
          currency: "INR",
          travelers: 4,
          tripType: "relaxation" as const,
          status: "planning" as const
        },
        {
          userId: currentUser.uid,
          title: "Rajasthan Heritage Tour",
          destination: "Rajasthan, India",
          startDate: new Date(2025, 2, 5),
          endDate: new Date(2025, 2, 12),
          budget: 45000,
          currency: "INR",
          travelers: 3,
          tripType: "cultural" as const,
          status: "planning" as const
        }
      ];

      for (const trip of sampleTrips) {
        const tripId = await createTrip(trip);
        console.log('✅ Created sample trip:', tripId);
      }
      
      toast({
        title: "Sample Trips Created! 🎉",
        description: "3 sample trips have been added to test the statistics.",
      });
      
      // Refresh the statistics
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Failed to create sample trips:', error);
      toast({
        title: "Error Creating Sample Trips",
        description: error.message || "Failed to create sample trips.",
        variant: "destructive"
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Your Journey */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-purple-600" />
                  <span>Your Journey</span>
                </CardTitle>
                <CardDescription>
                  Track your travel progress and achievements.
                  {currentUser && (
                    <span className="text-xs text-gray-500 block mt-1">
                      User ID: {currentUser.uid.slice(-8)} | Email: {currentUser.email}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">Loading your journey...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{journeyStats.tripsPlanned}</div>
                        <div className="text-sm text-gray-600 mt-1">Trips Planned</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{journeyStats.destinationsExplored}</div>
                        <div className="text-sm text-gray-600 mt-1">Destinations Explored</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className={`text-sm font-medium ${
                              journeyStats.profileStatus === 'Complete' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {journeyStats.profileStatus}
                            </div>
                            <div className="text-xs text-gray-600">Profile Status</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Debug info and test button */}
                    {journeyStats.tripsPlanned === 0 && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          No trips found. Create some sample trips to test the statistics.
                        </p>
                        <Button 
                          onClick={createSampleTrips} 
                          variant="outline" 
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          Create Sample Trips (Debug)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>
                      Your personal information and contact details.
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={currentUser.photoURL || ""} 
                        alt={userProfile?.displayName || currentUser.displayName || "Profile"} 
                      />
                      <AvatarFallback className="text-lg">
                        {(userProfile?.displayName || currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="displayName">Display Name</Label>
                          {isEditing ? (
                            <Input
                              id="displayName"
                              value={editData.displayName}
                              onChange={(e) => handleInputChange("displayName", e.target.value)}
                              placeholder="Your display name"
                            />
                          ) : (
                            <div className="flex items-center space-x-2 text-gray-900 mt-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{userProfile?.displayName || currentUser.displayName || "Not provided"}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <div className="flex items-center space-x-2 text-gray-900 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{currentUser.email}</span>
                            {currentUser.emailVerified && (
                              <Badge variant="secondary" className="ml-2">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editData.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          placeholder="+91 9876543210"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{userProfile?.phoneNumber || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="joinDate">Member Since</Label>
                      <div className="flex items-center space-x-2 text-gray-900 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {currentUser.metadata?.creationTime 
                            ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                            : "Recently"
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city">City</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={editData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Mumbai"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{userProfile?.city || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      {isEditing ? (
                        <Input
                          id="country"
                          value={editData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          placeholder="India"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900 mt-1">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span>{userProfile?.country || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Account Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive trip updates and recommendations</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-600">Add an extra layer of security</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-red-600">Danger Zone</div>
                    <div className="text-sm text-gray-600">Irreversible account actions</div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={logout}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}