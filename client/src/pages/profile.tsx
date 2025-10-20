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
  Bell
} from "lucide-react";
import { updateUserProfile } from "@/lib/firebaseService";

export default function Profile() {
  const { currentUser, userProfile, logout } = useAuth();
  const { toast } = useToast();
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
          </div>
        </div>
      </div>
    </div>
  );
}