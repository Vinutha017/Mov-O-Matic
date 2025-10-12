import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Route, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User, Heart, Plane, Camera, Mountain, Utensils, Building, DollarSign, Shield, Check } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account Creation
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    travelStyles: [] as string[],
    // Step 2: Verification
    verificationCode: "",
    // Step 3: Profile Setup
    currency: "",
    budgetRange: "",
    activities: [] as string[],
    hotelType: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);


  const travelStyles = [
    { id: "solo", label: "Solo Explorer", icon: User, description: "Independent adventures" },
    { id: "family", label: "Family Traveler", icon: Heart, description: "Family-friendly experiences" },
    { id: "adventure", label: "Adventure Seeker", icon: Mountain, description: "Thrilling outdoor activities" },
    { id: "foodie", label: "Food Enthusiast", icon: Utensils, description: "Culinary experiences" },
    { id: "culture", label: "Culture Lover", icon: Camera, description: "Museums, art, history" }
  ];



  const activities = [
    "Museums & Art", "Outdoor Adventures", "Local Cuisine", "Nightlife", 
    "Shopping", "Historical Sites", "Nature & Parks", "Photography",
    "Wellness & Spa", "Sports & Activities", "Festivals & Events", "Architecture"
  ];

  const currencies = [
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "EUR", label: "EUR (€)", symbol: "€" },
    { value: "GBP", label: "GBP (£)", symbol: "£" },
    { value: "JPY", label: "JPY (¥)", symbol: "¥" },
    { value: "AUD", label: "AUD (A$)", symbol: "A$" },
    { value: "CAD", label: "CAD (C$)", symbol: "C$" },
    { value: "INR", label: "INR (₹)", symbol: "₹" },
    { value: "CNY", label: "CNY (¥)", symbol: "¥" },
    { value: "KRW", label: "KRW (₩)", symbol: "₩" },
    { value: "SGD", label: "SGD (S$)", symbol: "S$" }
  ];

  const getBudgetRanges = (currency: string) => {
    const selectedCurrency = currencies.find(c => c.value === currency);
    const symbol = selectedCurrency ? selectedCurrency.symbol : "$";
    
    const ranges = {
      USD: [
        { value: "budget", label: `Budget (${symbol}50-100/day)` },
        { value: "mid", label: `Mid-range (${symbol}100-250/day)` },
        { value: "luxury", label: `Luxury (${symbol}250+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      EUR: [
        { value: "budget", label: `Budget (${symbol}45-90/day)` },
        { value: "mid", label: `Mid-range (${symbol}90-220/day)` },
        { value: "luxury", label: `Luxury (${symbol}220+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      GBP: [
        { value: "budget", label: `Budget (${symbol}40-80/day)` },
        { value: "mid", label: `Mid-range (${symbol}80-200/day)` },
        { value: "luxury", label: `Luxury (${symbol}200+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      JPY: [
        { value: "budget", label: `Budget (${symbol}7,000-14,000/day)` },
        { value: "mid", label: `Mid-range (${symbol}14,000-35,000/day)` },
        { value: "luxury", label: `Luxury (${symbol}35,000+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      AUD: [
        { value: "budget", label: `Budget (${symbol}70-140/day)` },
        { value: "mid", label: `Mid-range (${symbol}140-350/day)` },
        { value: "luxury", label: `Luxury (${symbol}350+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      CAD: [
        { value: "budget", label: `Budget (${symbol}65-130/day)` },
        { value: "mid", label: `Mid-range (${symbol}130-325/day)` },
        { value: "luxury", label: `Luxury (${symbol}325+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      INR: [
        { value: "budget", label: `Budget (${symbol}4,000-8,000/day)` },
        { value: "mid", label: `Mid-range (${symbol}8,000-20,000/day)` },
        { value: "luxury", label: `Luxury (${symbol}20,000+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      CNY: [
        { value: "budget", label: `Budget (${symbol}350-700/day)` },
        { value: "mid", label: `Mid-range (${symbol}700-1,750/day)` },
        { value: "luxury", label: `Luxury (${symbol}1,750+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      KRW: [
        { value: "budget", label: `Budget (${symbol}65,000-130,000/day)` },
        { value: "mid", label: `Mid-range (${symbol}130,000-325,000/day)` },
        { value: "luxury", label: `Luxury (${symbol}325,000+/day)` },
        { value: "flexible", label: "Flexible" }
      ],
      SGD: [
        { value: "budget", label: `Budget (${symbol}70-140/day)` },
        { value: "mid", label: `Mid-range (${symbol}140-350/day)` },
        { value: "luxury", label: `Luxury (${symbol}350+/day)` },
        { value: "flexible", label: "Flexible" }
      ]
    };
    
    return ranges[currency as keyof typeof ranges] || ranges.USD;
  };

  const hotelTypes = [
    { value: "budget", label: "Budget Hotels & Hostels" },
    { value: "mid", label: "Mid-range Hotels" },
    { value: "luxury", label: "Luxury Hotels & Resorts" },
    { value: "boutique", label: "Boutique & Unique Stays" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear budget range when currency changes
      ...(name === 'currency' && { budgetRange: '' })
    }));
  };



  const handleTravelStyleToggle = (styleId: string) => {
    setFormData(prev => ({
      ...prev,
      travelStyles: prev.travelStyles.includes(styleId)
        ? prev.travelStyles.filter(s => s !== styleId)
        : prev.travelStyles.length < 3
        ? [...prev.travelStyles, styleId]
        : prev.travelStyles
    }));
  };

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : prev.activities.length < 8
        ? [...prev.activities, activity]
        : prev.activities
    }));
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields in step 1
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (formData.travelStyles.length < 2 || formData.travelStyles.length > 3) {
      alert(`Please select 2-3 travel styles. You currently have ${formData.travelStyles.length} selected.`);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate account creation and sending verification email
    setTimeout(() => {
      setIsLoading(false);
      setVerificationSent(true);
      setCurrentStep(2);
      console.log("Account created, verification sent:", formData);
    }, 2000);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(3);
      console.log("Verification successful");
    }, 1500);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required profile fields
    if (!formData.currency) {
      alert('Please select your preferred currency.');
      return;
    }
    
    if (!formData.budgetRange) {
      alert('Please select your travel budget range.');
      return;
    }
    
    if (formData.activities.length < 6 || formData.activities.length > 8) {
      alert(`Please select between 6-8 activities. You currently have ${formData.activities.length} selected.`);
      return;
    }
    
    if (!formData.hotelType) {
      alert('Please select your preferred hotel type.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate profile setup completion
    setTimeout(() => {
      setIsLoading(false);
      console.log("Profile setup complete:", formData);
      
      // Store user profile data for the welcome page and dashboard
      localStorage.setItem('userProfile', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        currency: formData.currency,
        budgetRange: formData.budgetRange,
        activities: formData.activities,
        hotelType: formData.hotelType,
        travelStyles: formData.travelStyles
      }));
      
      // Store user name for quick access
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
      
      // Redirect to welcome page
      setLocation('/welcome');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Handle social login
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-blue-200/30 rounded-full blur-3xl transform translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl transform translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Route className="text-white text-xl" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Move-O-Matic
            </span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Start your travel planning journey today</p>
        </div>

        {/* Multi-step Signup Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl rounded-3xl p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'} font-medium`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'} rounded-full`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'} font-medium`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'} rounded-full`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'} font-medium`}>
                3
              </div>
            </div>
          </div>

          {/* DEBUG: Step Navigation - Remove this in production */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">DEBUG: Current Step = {currentStep}</p>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className={currentStep === 1 ? 'bg-blue-100' : ''}
              >
                Step 1
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className={currentStep === 2 ? 'bg-blue-100' : ''}
              >
                Step 2
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentStep(3)}
                className={currentStep === 3 ? 'bg-blue-100' : ''}
              >
                Step 3
              </Button>
            </div>
          </div>

          {/* Step 1: Account Creation */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">DEBUG: Showing Step 1</div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Creation</h2>
                <p className="text-gray-600">Enter your details to get started</p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="pl-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="pl-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="pl-10 pr-12 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="pl-10 pr-12 h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Travel Style Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 font-medium">Preferred Travel Styles (Choose 2-3) *</Label>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          formData.travelStyles.length === 0 
                            ? 'text-gray-500 bg-gray-100' 
                            : formData.travelStyles.length < 2 
                            ? 'text-orange-600 bg-orange-100' 
                            : formData.travelStyles.length >= 2 && formData.travelStyles.length <= 3
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {formData.travelStyles.length}/3 selected
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          formData.travelStyles.length === 0 
                            ? 'bg-gray-300' 
                            : formData.travelStyles.length < 2 
                            ? 'bg-orange-500' 
                            : formData.travelStyles.length >= 2 && formData.travelStyles.length <= 3
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((formData.travelStyles.length / 3) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Minimum Requirement Indicator */}
                    <div className="relative">
                      <div 
                        className="absolute top-0 w-0.5 h-2 bg-blue-400 opacity-60"
                        style={{ left: `${(2 / 3) * 100}%` }}
                        title="Minimum 2 travel styles required"
                      ></div>
                    </div>
                    
                    {/* Status Message */}
                    <div className="text-xs">
                      {formData.travelStyles.length === 0 && (
                        <p className="text-gray-500">Please select 2-3 travel styles that best describe you</p>
                      )}
                      {formData.travelStyles.length > 0 && formData.travelStyles.length < 2 && (
                        <p className="text-orange-600">
                          Select {2 - formData.travelStyles.length} more travel style{2 - formData.travelStyles.length === 1 ? '' : 's'} (minimum 2 required)
                        </p>
                      )}
                      {formData.travelStyles.length >= 2 && formData.travelStyles.length <= 3 && (
                        <p className="text-green-600 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Perfect! You've selected {formData.travelStyles.length} travel style{formData.travelStyles.length === 1 ? '' : 's'}</span>
                          {formData.travelStyles.length < 3 && <span className="text-gray-500">(you can select {3 - formData.travelStyles.length} more)</span>}
                        </p>
                      )}
                      {formData.travelStyles.length > 3 && (
                        <p className="text-red-600 flex items-center space-x-1">
                          <span>⚠️ Please remove {formData.travelStyles.length - 3} travel style{formData.travelStyles.length - 3 === 1 ? '' : 's'} (maximum 3 allowed)</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {travelStyles.map((style) => {
                      const isSelected = formData.travelStyles.includes(style.id);
                      const isDisabled = !isSelected && formData.travelStyles.length >= 3;
                      return (
                        <label 
                          key={style.id} 
                          className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : isDisabled 
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={() => handleTravelStyleToggle(style.id)}
                            className={isSelected ? 'border-blue-500' : ''}
                          />
                          <div className="flex items-center flex-1 ml-3">
                            <style.icon className={`w-5 h-5 mr-3 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div>
                              <div className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{style.label}</div>
                              <div className="text-sm text-gray-500">{style.description}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Selected Travel Styles Summary */}
                  {formData.travelStyles.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Your Selected Travel Styles:</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.travelStyles.map((styleId) => {
                          const style = travelStyles.find(s => s.id === styleId);
                          return style ? (
                            <span 
                              key={styleId}
                              className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
                            >
                              <span>{style.label}</span>
                              <button
                                type="button"
                                onClick={() => handleTravelStyleToggle(styleId)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              >
                                <span className="sr-only">Remove {style.label}</span>
                                <span className="text-blue-500 text-xs">×</span>
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    isLoading || 
                    !formData.firstName || 
                    !formData.lastName || 
                    !formData.email || 
                    !formData.password || 
                    !formData.confirmPassword || 
                    formData.travelStyles.length < 2 ||
                    formData.travelStyles.length > 3 ||
                    formData.password !== formData.confirmPassword
                  }
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Social Signup Options */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-sm text-gray-500">or continue with</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="h-12 bg-white/50 border-gray-200/50 hover:bg-white/80 rounded-xl"
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
                    onClick={() => handleSocialLogin('apple')}
                    className="h-12 bg-white/50 border-gray-200/50 hover:bg-white/80 rounded-xl"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Apple
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">DEBUG: Showing Step 2</div>
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Mail className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                <p className="text-gray-600 mb-4">
                  We've sent a verification code to<br />
                  <strong className="text-blue-600">{formData.email}</strong>
                </p>
                
                {/* Email Status Indicator */}
                <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">Email sent successfully</span>
                </div>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="verificationCode" className="text-gray-700 font-medium">
                    Enter Verification Code
                  </Label>
                  
                  {/* Enhanced Code Input */}
                  <div className="relative">
                    <Input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      placeholder="000000"
                      value={formData.verificationCode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      className="h-16 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-center text-3xl tracking-[0.5em] font-mono"
                    />
                    
                    {/* Visual feedback for code length */}
                    <div className="flex justify-center mt-2 space-x-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            i < formData.verificationCode.length 
                              ? 'bg-blue-500' 
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Code validation feedback */}
                  {formData.verificationCode.length > 0 && (
                    <div className="text-center">
                      {formData.verificationCode.length < 6 ? (
                        <p className="text-sm text-blue-600">
                          {6 - formData.verificationCode.length} more digit{6 - formData.verificationCode.length !== 1 ? 's' : ''} needed
                        </p>
                      ) : (
                        <p className="text-sm text-green-600 flex items-center justify-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span>Code complete - ready to verify!</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || formData.verificationCode.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Verify Email</span>
                    </div>
                  )}
                </Button>

                {/* Enhanced Resend Section */}
                <div className="text-center space-y-3">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500">Need help?</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        // Resend verification code
                        console.log('Resending verification code');
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 2000);
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Resend verification code
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      onClick={() => setCurrentStep(1)}
                    >
                      ← Change email address
                    </Button>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Security tip:</p>
                      <p>The verification code expires in 10 minutes. Check your spam folder if you don't see the email.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Profile Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">DEBUG: Showing Step 3</div>
              <div className="text-center mb-6">
                <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                <p className="text-gray-600">All fields are required to personalize your experience</p>
                <div className="inline-flex items-center mt-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm text-red-700">* All fields must be completed</span>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Currency Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Preferred Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Choose your preferred currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">{currency.symbol}</span>
                            <span>{currency.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Travel Budget Range *</Label>
                  <Select 
                    value={formData.budgetRange} 
                    onValueChange={(value) => handleSelectChange('budgetRange', value)}
                    disabled={!formData.currency}
                  >
                    <SelectTrigger className={`h-12 rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm ${!formData.currency ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <SelectValue placeholder={formData.currency ? "Choose your travel budget range" : "Select currency first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.currency && getBudgetRanges(formData.currency).map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.currency && (
                    <p className="text-xs text-gray-500">Please select a currency first to see budget ranges</p>
                  )}
                </div>

                {/* Favorite Activities */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700 font-medium">Favorite Activities (Choose 6-8)</Label>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          formData.activities.length === 0 
                            ? 'text-gray-500 bg-gray-100' 
                            : formData.activities.length < 6 
                            ? 'text-orange-600 bg-orange-100' 
                            : formData.activities.length >= 6 && formData.activities.length <= 8
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {formData.activities.length}/8 selected
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          formData.activities.length === 0 
                            ? 'bg-gray-300' 
                            : formData.activities.length < 6 
                            ? 'bg-orange-500' 
                            : formData.activities.length >= 6 && formData.activities.length <= 8
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((formData.activities.length / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Minimum Requirement Indicator */}
                    <div className="relative">
                      <div 
                        className="absolute top-0 w-0.5 h-2 bg-blue-400 opacity-60"
                        style={{ left: `${(6 / 8) * 100}%` }}
                        title="Minimum 6 activities required"
                      ></div>
                    </div>
                    
                    {/* Status Message */}
                    <div className="text-xs">
                      {formData.activities.length === 0 && (
                        <p className="text-gray-500">Please select 6-8 activities that interest you most</p>
                      )}
                      {formData.activities.length > 0 && formData.activities.length < 6 && (
                        <p className="text-orange-600">
                          Select {6 - formData.activities.length} more activit{6 - formData.activities.length === 1 ? 'y' : 'ies'} (minimum 6 required)
                        </p>
                      )}
                      {formData.activities.length >= 6 && formData.activities.length <= 8 && (
                        <p className="text-green-600 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Perfect! You've selected {formData.activities.length} activities</span>
                          {formData.activities.length < 8 && <span className="text-gray-500">(you can select {8 - formData.activities.length} more)</span>}
                        </p>
                      )}
                      {formData.activities.length > 8 && (
                        <p className="text-red-600 flex items-center space-x-1">
                          <span>⚠️ Please remove {formData.activities.length - 8} activit{formData.activities.length - 8 === 1 ? 'y' : 'ies'} (maximum 8 allowed)</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {activities.map((activity) => {
                      const isSelected = formData.activities.includes(activity);
                      const isDisabled = !isSelected && formData.activities.length >= 8;
                      return (
                        <label 
                          key={activity} 
                          className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                              : isDisabled 
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={() => handleActivityToggle(activity)}
                            className={isSelected ? 'border-blue-500' : ''}
                          />
                          <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                            {activity}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-blue-500 ml-auto" />}
                        </label>
                      );
                    })}
                  </div>

                  {/* Selected Activities Summary */}
                  {formData.activities.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Your Selected Activities:</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.activities.map((activity) => (
                          <span 
                            key={activity}
                            className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
                          >
                            <span>{activity}</span>
                            <button
                              type="button"
                              onClick={() => handleActivityToggle(activity)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <span className="sr-only">Remove {activity}</span>
                              <span className="text-blue-500 text-xs">×</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hotel Type */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 font-medium">Preferred Hotel Type *</Label>
                    {formData.hotelType && (
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {hotelTypes.map((type) => (
                      <label 
                        key={type.value} 
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.hotelType === type.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hotelType"
                          value={type.value}
                          checked={formData.hotelType === type.value}
                          onChange={(e) => handleSelectChange('hotelType', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center flex-1">
                          <Building className={`w-5 h-5 mr-3 ${
                            formData.hotelType === type.value ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className={`font-medium ${
                              formData.hotelType === type.value ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {type.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {type.value === 'budget' && 'Affordable stays, hostels, budget hotels'}
                              {type.value === 'mid' && 'Comfortable hotels with good amenities'}
                              {type.value === 'luxury' && 'Premium hotels, resorts, 5-star experiences'}
                              {type.value === 'boutique' && 'Unique properties, local character'}
                            </div>
                          </div>
                          {formData.hotelType === type.value && (
                            <Check className="w-5 h-5 text-blue-500 ml-3" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Clear Selection Option */}
                  {formData.hotelType && (
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectChange('hotelType', '')}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Clear selection
                      </Button>
                    </div>
                  )}
                </div>

                {/* Profile Completion Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Completion</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Currency</span>
                      <span className={formData.currency ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formData.currency ? `✓ ${formData.currency}` : 'Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget Range</span>
                      <span className={formData.budgetRange ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formData.budgetRange ? '✓ Selected' : 'Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Activities (6-8 required)</span>
                      <span className={
                        formData.activities.length >= 6 && formData.activities.length <= 8 
                          ? 'text-green-600 font-medium' 
                          : formData.activities.length > 0 
                          ? 'text-orange-600 font-medium' 
                          : 'text-gray-400'
                      }>
                        {formData.activities.length >= 6 && formData.activities.length <= 8 
                          ? `✓ ${formData.activities.length} selected` 
                          : formData.activities.length > 0 
                          ? `${formData.activities.length}/8 selected` 
                          : 'Required'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hotel Preference</span>
                      <span className={formData.hotelType ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formData.hotelType ? '✓ Selected' : 'Required'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Completion percentage */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Profile Completeness</span>
                      <span className="font-medium text-blue-600">
                        {Math.round(([
                          formData.currency,
                          formData.budgetRange, 
                          formData.activities.length >= 6 && formData.activities.length <= 8, 
                          formData.hotelType
                        ].filter(Boolean).length / 4) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${([
                            formData.currency,
                            formData.budgetRange, 
                            formData.activities.length >= 6 && formData.activities.length <= 8, 
                            formData.hotelType
                          ].filter(Boolean).length / 4) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-blue-700 font-medium">Complete all fields to continue</p>
                    <p className="text-xs text-blue-600 mt-1">All preferences help us personalize your travel experience</p>
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      isLoading || 
                      !formData.currency ||
                      !formData.budgetRange || 
                      formData.activities.length < 6 || 
                      formData.activities.length > 8 || 
                      !formData.hotelType
                    }
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving Profile...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Complete Setup</span>
                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}