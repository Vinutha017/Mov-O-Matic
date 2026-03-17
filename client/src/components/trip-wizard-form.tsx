import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { createTrip, type Trip } from "@/lib/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import CityAutocomplete from "@/components/CityAutocomplete";
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  Heart, 
  Loader2, 
  Calendar,
  Hotel,
  Car,
  Utensils,
  Camera,
  Building,
  TreePine,
  Compass,
  Star,
  Wifi,
  Waves,
  ParkingCircle,
  MessageSquare,
  Plane,
  ChevronDown,
  Train,
  Bus,
  Target,
  Trophy,
  Shield,
  Check
} from "lucide-react";

// Form validation schema
const tripFormSchema = z.object({
  // Travel Information
  numberOfTravelers: z.number().min(1, "At least 1 traveler is required").max(20, "Maximum 20 travelers allowed"),
  startLocation: z.string().min(1, "Starting location is required"),
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  tripType: z.string().min(1, "Trip type is required"),
  modeOfTravel: z.string().min(1, "Mode of travel is required"),
  preferredDepartureTime: z.string().min(1, "Preferred departure time is required"),

  // Budget Preferences
  overallBudget: z.string().min(1, "Overall budget is required"),

  // Hotel Preferences
  hotelType: z.string().min(1, "Hotel type is required"),
  roomType: z.string().min(1, "Room type is required"),

  // Food & Activities
  foodPreferences: z.array(z.string()).min(1, "At least one food preference is required"),
  activityTypes: z.array(z.string()).min(1, "At least one activity type is required"),

  // Trip Theme
  tripTheme: z.string().min(1, "Trip theme is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),

  // Transport & Mobility
  transportPreferences: z.array(z.string()).min(1, "At least one transport preference is required"),
  mobilityRequirements: z.string().optional(),

  // Personalization
  travelStyle: z.string().min(1, "Travel style is required"),
  accommodationAmenities: z.array(z.string()).optional(),
  
  // Confirmation
  specialRequirements: z.string().optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

// India-specific data arrays
const indianFoodTypes = [
  "North Indian", "South Indian", "Punjabi", "Gujarati", "Rajasthani", "Bengali", 
  "Maharashtrian", "Tamil", "Kerala", "Hyderabadi", "Kashmiri", "Goan", 
  "Street Food", "Vegetarian", "Vegan", "Jain Food", "Coastal Cuisine"
];

const activityTypesIndia = [
  "Heritage Tours", "Wildlife Safari", "Spiritual/Religious", "Adventure Sports", 
  "Cultural Experiences", "Food Tours", "Photography", "Trekking", "River Rafting", 
  "Yoga & Meditation", "Ayurveda & Wellness", "Shopping", "Festivals", "Art & Crafts",
  "Backwater Cruises", "Desert Safari", "Mountain Biking", "Paragliding", "Scuba Diving"
];

const tripThemes = [
  "Cultural Heritage", "Adventure & Thrills", "Spiritual Journey", "Nature & Wildlife", 
  "Luxury & Comfort", "Budget Backpacking", "Family Fun", "Romantic Getaway", 
  "Solo Exploration", "Food & Culinary", "Photography Tour", "Wellness Retreat"
];

const interests = [
  "History & Monuments", "Art & Architecture", "Music & Dance", "Local Traditions", 
  "Wildlife Photography", "Trekking & Hiking", "Water Sports", "Spiritual Practices", 
  "Local Cuisine", "Handicrafts", "Festivals", "Rural Life", "Urban Exploration", 
  "Nightlife", "Shopping", "Photography", "Reading", "Meditation"
];

export default function TripWizardForm() {
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  
  // State for selected cities
  const [selectedStartCity, setSelectedStartCity] = useState<{name: string, state: string} | null>(null);
  const [selectedDestinationCity, setSelectedDestinationCity] = useState<{name: string, state: string} | null>(null);

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      numberOfTravelers: 2,
      startLocation: "",
      destination: "",
      startDate: "",
      endDate: "",
      tripType: "",
      modeOfTravel: "",
      preferredDepartureTime: "",
      overallBudget: "",
      hotelType: "",
      roomType: "",
      foodPreferences: [],
      activityTypes: [],
      tripTheme: "",
      interests: [],
      transportPreferences: [],
      mobilityRequirements: "",
      travelStyle: "",
      accommodationAmenities: [],
      specialRequirements: "",
    },
  });

  const sections = [
    { title: "Travel Information", icon: <MapPin className="w-5 h-5" />, requiredFields: ["startLocation", "destination", "startDate", "endDate", "tripType", "modeOfTravel", "preferredDepartureTime"] },
    { title: "Budget Preferences", icon: <DollarSign className="w-5 h-5" />, requiredFields: ["overallBudget"] },
    { title: "Hotel Preferences", icon: <Hotel className="w-5 h-5" />, requiredFields: ["hotelType", "roomType"] },
    { title: "Food & Activities", icon: <Utensils className="w-5 h-5" />, requiredFields: ["foodPreferences", "activityTypes"] },
    { title: "Trip Theme", icon: <Heart className="w-5 h-5" />, requiredFields: ["tripTheme", "interests"] },
    { title: "Transport & Mobility", icon: <Car className="w-5 h-5" />, requiredFields: ["transportPreferences"] },
    { title: "Personalization", icon: <Star className="w-5 h-5" />, requiredFields: ["travelStyle"] },
    { title: "Confirmation", icon: <Check className="w-5 h-5" />, requiredFields: [] },
  ];

  // Calculate progress
  const watchedFields = form.watch();
  const totalSections = sections.length;
  let completedSections = 0;

  sections.forEach((section) => {
    const isCompleted = section.requiredFields.every((field) => {
      const value = watchedFields[field as keyof TripFormData];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== '';
    });
    if (isCompleted) completedSections++;
  });

  const progressPercentage = (completedSections / totalSections) * 100;

  const submitMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      if (!currentUser) {
        throw new Error("You must be logged in to create a trip");
      }

      // Transform form data to AITripRequest format for Gemini
      const aiRequest = {
        description: `Plan a ${data.tripType.toLowerCase()} trip to ${data.destination} for ${data.numberOfTravelers} travelers`,
        destination: data.destination,
        startLocation: data.startLocation,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: parseFloat(data.overallBudget.split('-')[0].replace(/[^0-9]/g, '')) || 15000,
        travelers: data.numberOfTravelers,
        tripType: data.tripType,
        modeOfTravel: data.modeOfTravel,
        preferredDepartureTime: data.preferredDepartureTime,
        hotelType: data.hotelType,
        roomType: data.roomType,
        foodPreferences: data.foodPreferences,
        activityTypes: data.activityTypes,
        tripTheme: data.tripTheme,
        interests: data.interests,
        transportPreferences: data.transportPreferences,
        travelStyle: data.travelStyle,
        accommodationAmenities: data.accommodationAmenities || [],
        mobilityRequirements: data.mobilityRequirements,
        specialRequirements: data.specialRequirements
      };

      console.log("🚀 Generating AI itinerary with Gemini 2.5 Flash...");
      
      // Call the Gemini API to generate itinerary
      const response = await apiRequest('POST', '/api/trips/generate', aiRequest);
      const aiRecommendation = await response.json();

      console.log("✅ AI Itinerary Generated!", aiRecommendation);

      // Create trip data for Firestore with AI-generated content
      const tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: currentUser.uid,
        title: `Trip to ${data.destination}`,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: parseFloat(data.overallBudget.split('-')[0].replace(/[^0-9]/g, '')) || 0,
        travelers: data.numberOfTravelers,
        tripType: data.tripType as any,
        status: 'planning',
        aiRecommendation, // Include the AI-generated itinerary
        metadata: {
          travelInfo: {
            startLocation: data.startLocation,
            destinations: [data.destination], // Keep as array for compatibility
            tripType: data.tripType,
            modeOfTravel: data.modeOfTravel,
            preferredDepartureTime: data.preferredDepartureTime,
          },
          budget: {
            overallBudget: data.overallBudget,
          },
          hotelPreferences: {
            hotelType: data.hotelType,
            roomType: data.roomType,
          },
          preferences: {
            foodPreferences: data.foodPreferences,
            activityInterests: data.activityTypes,
            tripThemes: [data.tripTheme],
            travelPace: data.travelStyle,
            localTransportPreference: data.transportPreferences.join(', '),
            aiRecommendations: true,
            specialRequirements: data.specialRequirements,
          }
        }
      };

      // Save to Firestore
      const tripId = await createTrip(tripData);
      return { tripId, aiRecommendation };
    },
    onSuccess: ({ tripId, aiRecommendation }) => {
      toast({
        title: "Perfect Itinerary Generated! 🎉",
        description: "Your AI-powered travel plan is ready with personalized recommendations!",
      });
      setLocation(`/trip/${tripId}`);
    },
    onError: (error) => {
      toast({
        title: "Error Generating Itinerary",
        description: error.message || "Please try again. Our AI is working hard to create your perfect trip!",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TripFormData) => {
    submitMutation.mutate(data);
  };

  const nextSection = () => {
    const currentRequiredFields = sections[currentSection].requiredFields;
    
    // Validate current section fields
    const isCurrentSectionValid = currentRequiredFields.every((field) => {
      const value = watchedFields[field as keyof TripFormData];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== '';
    });

    if (!isCurrentSectionValid) {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all required information before proceeding to the next step.",
        variant: "destructive",
      });
      return;
    }

    setCurrentSection(Math.min(currentSection + 1, sections.length - 1));
  };

  const prevSection = () => {
    setCurrentSection(Math.max(currentSection - 1, 0));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Plan Your Perfect India Trip
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Let our AI create a personalized itinerary based on your preferences, budget, and travel style
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-orange-600">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {sections.map((section, index) => {
          const isCompleted = section.requiredFields.every((field) => {
            const value = watchedFields[field as keyof TripFormData];
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return value && value.toString().trim() !== '';
          });

          return (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                currentSection === index
                  ? 'bg-orange-500 text-white shadow-lg'
                  : isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.icon}
              <span className="hidden md:inline">{section.title}</span>
            </button>
          );
        })}
      </div>

      {/* Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-2xl text-gray-800">
            {sections[currentSection].icon}
            <span>{sections[currentSection].title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Section 0: Travel Information */}
              {currentSection === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="numberOfTravelers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Number of Travelers *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="border-orange-200 focus:border-orange-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Starting Location *</span>
                          </FormLabel>
                          <FormControl>
                            <CityAutocomplete
                              placeholder="Search for your departure city..."
                              value={selectedStartCity}
                              onChange={(city) => {
                                setSelectedStartCity(city);
                                if (city) {
                                  const locationString = `${city.name}, ${city.state}`;
                                  field.onChange(locationString);
                                } else {
                                  field.onChange("");
                                }
                              }}
                            />
                          </FormControl>
                          {field.value && <span className="text-xs text-gray-500 mt-1">Selected: {field.value}</span>}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>Destination *</span>
                        </FormLabel>
                        <FormDescription>Where would you like to visit?</FormDescription>
                        <FormControl>
                          <CityAutocomplete
                            placeholder="Search for your destination..."
                            value={selectedDestinationCity}
                            onChange={(city) => {
                              setSelectedDestinationCity(city);
                              if (city) {
                                const locationString = `${city.name}, ${city.state}`;
                                field.onChange(locationString);
                              } else {
                                field.onChange("");
                              }
                            }}
                          />
                        </FormControl>
                        {field.value && <span className="text-xs text-gray-500 mt-1">Selected: {field.value}</span>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Start Date *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="border-orange-200 focus:border-orange-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>End Date *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="border-orange-200 focus:border-orange-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tripType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trip Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-orange-200 focus:border-orange-400">
                                <SelectValue placeholder="Select trip type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="leisure">Leisure</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="adventure">Adventure</SelectItem>
                              <SelectItem value="cultural">Cultural</SelectItem>
                              <SelectItem value="spiritual">Spiritual</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modeOfTravel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Mode of Travel *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-orange-200 focus:border-orange-400">
                                <SelectValue placeholder="Select mode of travel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flight">Flight</SelectItem>
                              <SelectItem value="train">Train</SelectItem>
                              <SelectItem value="bus">Bus</SelectItem>
                              <SelectItem value="car">Car/Taxi</SelectItem>
                              <SelectItem value="mixed">Mixed (Multiple modes)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredDepartureTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Departure Time *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200 focus:border-orange-400">
                              <SelectValue placeholder="Select preferred departure time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="early-morning">Early Morning (6 AM - 9 AM)</SelectItem>
                            <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                            <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                            <SelectItem value="night">Night (8 PM - 12 AM)</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 1: Budget Preferences */}
              {currentSection === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="overallBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Overall Budget (per person in INR) *</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200 focus:border-orange-400">
                              <SelectValue placeholder="Select your budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5000-15000">₹5,000 - ₹15,000 (Budget)</SelectItem>
                            <SelectItem value="15000-30000">₹15,000 - ₹30,000 (Mid-range)</SelectItem>
                            <SelectItem value="30000-50000">₹30,000 - ₹50,000 (Premium)</SelectItem>
                            <SelectItem value="50000-100000">₹50,000 - ₹1,00,000 (Luxury)</SelectItem>
                            <SelectItem value="100000+">₹1,00,000+ (Ultra Luxury)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 2: Hotel Preferences */}
              {currentSection === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="hotelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Hotel className="w-4 h-4" />
                          <span>Preferred Accommodation Type *</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200 focus:border-orange-400">
                              <SelectValue placeholder="Select accommodation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget-hotel">Budget Hotel</SelectItem>
                            <SelectItem value="3-star">3-Star Hotel</SelectItem>
                            <SelectItem value="4-star">4-Star Hotel</SelectItem>
                            <SelectItem value="5-star">5-Star Hotel</SelectItem>
                            <SelectItem value="resort">Resort</SelectItem>
                            <SelectItem value="heritage">Heritage Hotel/Palace</SelectItem>
                            <SelectItem value="boutique">Boutique Hotel</SelectItem>
                            <SelectItem value="homestay">Homestay</SelectItem>
                            <SelectItem value="guesthouse">Guest House</SelectItem>
                            <SelectItem value="hostel">Hostel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200 focus:border-orange-400">
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single Room</SelectItem>
                            <SelectItem value="double">Double Room</SelectItem>
                            <SelectItem value="twin">Twin Sharing</SelectItem>
                            <SelectItem value="suite">Suite</SelectItem>
                            <SelectItem value="family">Family Room</SelectItem>
                            <SelectItem value="deluxe">Deluxe Room</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 3: Food & Activities */}
              {currentSection === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="foodPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Utensils className="w-4 h-4" />
                          <span>Food Preferences *</span>
                        </FormLabel>
                        <FormDescription>Select your favorite Indian cuisine types</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-orange-200 rounded-lg p-4">
                          {indianFoodTypes.map((food) => (
                            <div key={food} className="flex items-center space-x-2">
                              <Checkbox
                                id={food}
                                checked={field.value.includes(food)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, food]
                                    : field.value.filter((item) => item !== food);
                                  field.onChange(newValue);
                                }}
                              />
                              <Label htmlFor={food} className="text-sm cursor-pointer">
                                {food}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="activityTypes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Camera className="w-4 h-4" />
                          <span>Preferred Activities *</span>
                        </FormLabel>
                        <FormDescription>Choose activities you'd like to experience in India</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-orange-200 rounded-lg p-4">
                          {activityTypesIndia.map((activity) => (
                            <div key={activity} className="flex items-center space-x-2">
                              <Checkbox
                                id={activity}
                                checked={field.value.includes(activity)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, activity]
                                    : field.value.filter((item) => item !== activity);
                                  field.onChange(newValue);
                                }}
                              />
                              <Label htmlFor={activity} className="text-sm cursor-pointer">
                                {activity}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 4: Trip Theme */}
              {currentSection === 4 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="tripTheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>Trip Theme *</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200 focus:border-orange-400">
                              <SelectValue placeholder="Select your trip theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tripThemes.map((theme) => (
                              <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Star className="w-4 h-4" />
                          <span>Your Interests *</span>
                        </FormLabel>
                        <FormDescription>Select areas that interest you most</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-orange-200 rounded-lg p-4">
                          {interests.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={interest}
                                checked={field.value.includes(interest)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, interest]
                                    : field.value.filter((item) => item !== interest);
                                  field.onChange(newValue);
                                }}
                              />
                              <Label htmlFor={interest} className="text-sm cursor-pointer">
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 5: Transport & Mobility */}
              {currentSection === 5 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="transportPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Car className="w-4 h-4" />
                          <span>Transport Preferences *</span>
                        </FormLabel>
                        <FormDescription>Select your preferred modes of transportation within destinations</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { value: "private-car", label: "Private Car/Taxi", icon: Car },
                            { value: "public-transport", label: "Public Transport", icon: Bus },
                            { value: "train", label: "Local Trains", icon: Train },
                            { value: "auto-rickshaw", label: "Auto Rickshaw", icon: Car },
                            { value: "bike-rental", label: "Bike Rental", icon: Car },
                            { value: "walking", label: "Walking", icon: Car }
                          ].map((transport) => (
                            <div key={transport.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={transport.value}
                                checked={field.value.includes(transport.value)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, transport.value]
                                    : field.value.filter((item) => item !== transport.value);
                                  field.onChange(newValue);
                                }}
                              />
                              <Label htmlFor={transport.value} className="text-sm cursor-pointer">
                                {transport.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobilityRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Mobility Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special mobility needs or accessibility requirements..."
                            {...field}
                            className="border-orange-200 focus:border-orange-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 6: Personalization */}
              {currentSection === 6 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="travelStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Star className="w-4 h-4" />
                          <span>Travel Style *</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200 focus:border-orange-400">
                              <SelectValue placeholder="Select your travel style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="relaxed">Relaxed & Leisurely</SelectItem>
                            <SelectItem value="moderate">Moderate Pace</SelectItem>
                            <SelectItem value="packed">Action-Packed</SelectItem>
                            <SelectItem value="flexible">Flexible & Spontaneous</SelectItem>
                            <SelectItem value="planned">Highly Planned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accommodationAmenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Hotel Amenities</FormLabel>
                        <FormDescription>Select amenities that are important to you</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { value: "wifi", label: "Free WiFi", icon: Wifi },
                            { value: "pool", label: "Swimming Pool", icon: Waves },
                            { value: "gym", label: "Fitness Center", icon: Trophy },
                            { value: "spa", label: "Spa Services", icon: Heart },
                            { value: "parking", label: "Parking", icon: ParkingCircle },
                            { value: "restaurant", label: "Restaurant", icon: Utensils },
                            { value: "room-service", label: "Room Service", icon: Hotel },
                            { value: "concierge", label: "Concierge", icon: MessageSquare },
                            { value: "ac", label: "Air Conditioning", icon: Shield },
                          ].map((amenity) => (
                            <div key={amenity.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={amenity.value}
                                checked={field.value?.includes(amenity.value) || false}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  const newValue = checked
                                    ? [...currentValue, amenity.value]
                                    : currentValue.filter((item) => item !== amenity.value);
                                  field.onChange(newValue);
                                }}
                              />
                              <Label htmlFor={amenity.value} className="text-sm cursor-pointer">
                                {amenity.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 7: Confirmation */}
              {currentSection === 7 && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Almost Done! 🎉</h3>
                    <p className="text-gray-600">
                      Review your preferences and add any special requirements before we create your personalized itinerary.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="specialRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requirements or Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special dietary requirements, accessibility needs, or other preferences we should know about..."
                            {...field}
                            className="border-orange-200 focus:border-orange-400 min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Summary Preview */}
                  <div className="bg-orange-50 rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-gray-800">Trip Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Travelers:</span> {watchedFields.numberOfTravelers}
                      </div>
                      <div>
                        <span className="font-medium">Destination:</span> {watchedFields.destination || 'Not selected'}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {watchedFields.startDate} to {watchedFields.endDate}
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span> {watchedFields.overallBudget}
                      </div>
                      <div>
                        <span className="font-medium">Trip Theme:</span> {watchedFields.tripTheme}
                      </div>
                      <div>
                        <span className="font-medium">Travel Style:</span> {watchedFields.travelStyle}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-orange-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Previous
                </Button>
                
                {currentSection < sections.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextSection}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Next Section
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Your Perfect Itinerary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate My Perfect Itinerary!
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}