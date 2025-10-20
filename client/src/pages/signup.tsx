import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Camera, Sparkles, Plane, Heart, Phone } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  
  // Get email from URL params if user was redirected from login
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledEmail = urlParams.get('email') || '';
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: prefilledEmail,
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    city: "",
    country: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showEmailExistsDialog, setShowEmailExistsDialog] = useState(false);
  const [existingEmail, setExistingEmail] = useState("");
  const { signup, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.phoneNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic phone number validation (allow international formats)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.password) {
      toast({
        title: "Validation Error",
        description: "Please enter a password.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Signup Timeout",
        description: "The signup process is taking too long. Please try again.",
        variant: "destructive",
      });
    }, 30000); // 30 seconds timeout
    
    try {
      // Pass additional profile data to signup function
      const additionalData = {
        phoneNumber: formData.phoneNumber,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        city: formData.city,
        country: formData.country
      };
      
      await signup(formData.email, formData.password, formData.fullName, additionalData);
      clearTimeout(timeoutId);
      
      toast({
        title: "Account Created Successfully",
        description: "Welcome to Mov-O-Matic! You can now explore all our features.",
      });
      
      // Redirect new users to welcome page
      setLocation('/welcome');
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle email already exists error specially
      if (error.name === 'EmailAlreadyInUse') {
        setExistingEmail(formData.email);
        setShowEmailExistsDialog(true);
      } else {
        toast({
          title: "Signup Failed",
          description: error.message || "An error occurred during signup",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      toast({
        title: "Account Created Successfully",
        description: "Welcome to Mov-O-Matic! Let's plan your first trip.",
      });
      setLocation('/welcome');
    } catch (error: any) {
      toast({
        title: "Google Sign-Up Failed",
        description: error.message || "An error occurred during Google sign-up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce opacity-30">
          <Plane className="w-12 h-12 text-blue-400 transform rotate-45" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse opacity-20">
          <Heart className="w-8 h-8 text-pink-400" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-bounce opacity-25">
          <MapPin className="w-10 h-10 text-green-400" />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-pulse opacity-15">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Mov-O-Matic</h1>
          <p className="text-gray-600">Start your travel planning journey today</p>
        </div>

        {/* Signup Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-3xl p-8">
          {/* Show message if email was pre-filled from login redirect */}
          {prefilledEmail && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <Mail className="w-5 h-5" />
                <p className="text-sm font-medium">
                  No account found for <strong>{prefilledEmail}</strong>
                </p>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Let's create your account with this email address.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={URL.createObjectURL(profilePicture)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="pl-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="pl-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Location (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700 font-medium">City <span className="text-gray-400">(optional)</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={handleChange}
                    className="pl-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700 font-medium">Country <span className="text-gray-400">(optional)</span></Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Your country"
                  value={formData.country}
                  onChange={handleChange}
                  className="h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="h-11 border-gray-200/50 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Apple Sign-In will be available soon!",
                  });
                }}
                disabled={isLoading}
                className="h-11 border-gray-200/50 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 8.025.015 7.877.032a8.18 8.18 0 0 0-2.356.569 3.96 3.96 0 0 0-1.438 1.438 8.18 8.18 0 0 0-.569 2.356C3.495 4.525 3.48 4.896 3.48 8.517v6.966c0 3.621.015 3.992.032 4.14.048.847.207 1.395.432 1.925a3.96 3.96 0 0 0 1.438 1.438c.53.225 1.078.384 1.925.432.148.017.519.032 4.14.032h6.966c3.621 0 3.992-.015 4.14-.032.847-.048 1.395-.207 1.925-.432a3.96 3.96 0 0 0 1.438-1.438c.225-.53.384-1.078.432-1.925.017-.148.032-.519.032-4.14V8.517c0-3.621-.015-3.992-.032-4.14a8.18 8.18 0 0 0-.569-2.356A3.96 3.96 0 0 0 19.441.601a8.18 8.18 0 0 0-2.356-.569C16.925.015 16.554 0 12.933 0H12.017z"/>
                  <path fill="white" d="M12 7.378c-2.552 0-4.622 2.069-4.622 4.622S9.448 16.622 12 16.622s4.622-2.069 4.622-4.622S14.552 7.378 12 7.378zM12 15.004c-1.657 0-3.004-1.346-3.004-3.004S10.343 8.996 12 8.996s3.004 1.346 3.004 3.004-1.346 3.004-3.004 3.004z"/>
                </svg>
                Apple
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200/50">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  Sign in here
                </span>
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* Email Already Exists Dialog */}
      <AlertDialog open={showEmailExistsDialog} onOpenChange={setShowEmailExistsDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Account Already Exists</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                An account with <strong>{existingEmail}</strong> already exists.
              </p>
              <p className="text-sm text-gray-600">
                Would you like to sign in to your existing account instead?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowEmailExistsDialog(false)}
              className="w-full sm:w-auto"
            >
              Use Different Email
            </Button>
            <AlertDialogAction
              onClick={() => {
                setShowEmailExistsDialog(false);
                setLocation('/login');
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Sign In Instead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}