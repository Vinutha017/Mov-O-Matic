import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTrips } from "@/hooks/use-trips";
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
  Clock,
  Eye,
  Trash2
} from "lucide-react";
import { updateUserProfile } from "@/lib/firebaseService";

export default function Profile() {
  const { currentUser, userProfile, logout } = useAuth();
  const { toast } = useToast();
  const { trips, loading: tripsLoading, refetch: fetchTrips, removeTrip } = useTrips();
  const [isEditing, setIsEditing] = useState(false);
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

  // Fetch user trips when component loads
  useEffect(() => {
    fetchTrips();
  }, [currentUser]);

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
    if (!currentUser || !userProfile) return;

    try {
      await updateUserProfile(currentUser.uid, {
        displayName: editData.displayName,
        phoneNumber: editData.phoneNumber,
        city: editData.city,
        country: editData.country,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      await removeTrip(tripId);
      toast({
        title: "Trip Deleted",
        description: "Your trip has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed", 
        description: "Failed to delete the trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please sign in to view your profile</h2>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
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
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  {userProfile?.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <CardTitle className="text-xl">
                  {userProfile?.displayName || currentUser.displayName || "User"}
                </CardTitle>
                <CardDescription className="flex items-center justify-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Account
                  </Badge>
                </div>
                
                {userProfile?.createdAt && (
                  <div className="text-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Travel Statistics */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Travel Statistics</span>
                </CardTitle>
                <CardDescription>
                  Your travel journey at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                    <div className="text-sm text-gray-600">Total Trips</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {trips.filter(trip => new Date(trip.endDate) < new Date()).length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {trips.filter(trip => new Date(trip.startDate) > new Date()).length}
                    </div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {new Set(trips.map(trip => trip.destination)).size}
                    </div>
                    <div className="text-sm text-gray-600">Destinations</div>
                  </div>
                </div>
                
                {trips.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Favorite Destinations</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        trips.reduce((acc, trip) => {
                          acc[trip.destination] = (acc[trip.destination] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([destination, count]) => (
                        <Badge key={destination} variant="outline" className="text-xs">
                          {destination} {count > 1 && `(${count})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Your basic profile information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      name="displayName"
                      value={editData.displayName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {userProfile?.displayName || currentUser.displayName || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{currentUser.email}</span>
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={editData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{userProfile?.phoneNumber || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        name="city"
                        value={editData.city}
                        onChange={handleChange}
                        placeholder="Your city"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{userProfile?.city || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    {isEditing ? (
                      <Input
                        id="country"
                        name="country"
                        value={editData.country}
                        onChange={handleChange}
                        placeholder="Your country"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>{userProfile?.country || "Not provided"}</span>
                      </div>
                    )}
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

            {/* Planned Trips Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5" />
                  <span>My Planned Trips</span>
                </CardTitle>
                <CardDescription>
                  View and manage all your planned travel adventures.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tripsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading your trips...</p>
                  </div>
                ) : trips.length === 0 ? (
                  <div className="text-center py-8">
                    <Plane className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No trips planned yet</h3>
                    <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
                    <Link href="/trip-wizard">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Plan Your First Trip
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trips.map((trip) => (
                      <div key={trip.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-lg text-gray-900">
                                {trip.destination}
                              </h4>
                              <Badge 
                                variant={
                                  new Date(trip.startDate) > new Date() ? "default" : 
                                  new Date(trip.endDate) < new Date() ? "secondary" : "destructive"
                                }
                              >
                                {new Date(trip.startDate) > new Date() ? "Upcoming" : 
                                 new Date(trip.endDate) < new Date() ? "Completed" : "Ongoing"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{trip.travelers} travelers</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>₹{trip.budget?.toLocaleString() || 'N/A'}</span>
                              </div>
                            </div>

                            {trip.title && trip.title !== trip.destination && (
                              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                {trip.title}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {trip.tripType && (
                                <Badge variant="outline">{trip.tripType}</Badge>
                              )}
                              {trip.status && (
                                <Badge variant="outline">{trip.status}</Badge>
                              )}
                              {trip.currency && (
                                <Badge variant="outline">{trip.currency}</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {trip.id ? (
                              <Link href={`/itinerary/${trip.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => trip.id && handleDeleteTrip(trip.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={!trip.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Trip Stats */}
                        {trip.aiRecommendation && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>AI Recommendations Generated</span>
                              <div className="flex items-center space-x-4">
                                <span>{trip.aiRecommendation.hotels?.length || 0} Hotels</span>
                                <span>{trip.aiRecommendation.attractions?.length || 0} Attractions</span>
                                <span>{trip.aiRecommendation.restaurants?.length || 0} Restaurants</span>
                                <span>{trip.aiRecommendation.itinerary?.length || 0} Days Planned</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}