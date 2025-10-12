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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  ChevronDown,  // Add missing import
} from "lucide-react";

// Update form schema with all fields
const tripFormSchema = z.object({
  destination: z.string().min(2, "Please enter a destination"),
  startDate: z.string().min(1, "Please select start date"),
  endDate: z.string().min(1, "Please select end date"),
  travelers: z.string().min(1, "Please select travelers type"),
  numberOfTravelers: z.number().min(1, "Please enter number of travelers"),
  tripTheme: z.array(z.string()).min(1, "Please select at least one theme"),
  travelPace: z.string().min(1, "Please select travel pace"),
  budgetPerPerson: z.string().min(1, "Please select budget range"),
  preferredTransport: z.array(z.string()).min(1, "Please select preferred transport"),
  hotelCategory: z.string().min(1, "Please select hotel category"),
  locationPreference: z.string().min(1, "Please select location preference"),
  mealPlan: z.string().min(1, "Please select meal plan"),
  keyAmenities: z.array(z.string()).optional(),
  activityCategories: z.array(z.string()).min(1, "Please select activities"),
  specialNotes: z.string().optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

// Indian destinations for autocomplete
const indianDestinations = [
  // Major Indian Cities
  "Mumbai, Maharashtra", "Delhi, Delhi", "Bangalore, Karnataka", "Chennai, Tamil Nadu",
  "Kolkata, West Bengal", "Hyderabad, Telangana", "Pune, Maharashtra", "Ahmedabad, Gujarat",
  "Surat, Gujarat", "Jaipur, Rajasthan", "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra", "Indore, Madhya Pradesh", "Thane, Maharashtra", "Bhopal, Madhya Pradesh",
  "Visakhapatnam, Andhra Pradesh", "Pimpri-Chinchwad, Maharashtra", "Patna, Bihar", "Vadodara, Gujarat",
  
  // Popular Tourist Destinations
  "Goa", "Kerala (Backwaters)", "Manali, Himachal Pradesh", "Shimla, Himachal Pradesh",
  "Rishikesh, Uttarakhand", "Haridwar, Uttarakhand", "Dharamshala, Himachal Pradesh",
  "Agra, Uttar Pradesh", "Varanasi, Uttar Pradesh", "Udaipur, Rajasthan", "Jodhpur, Rajasthan",
  "Jaisalmer, Rajasthan", "Pushkar, Rajasthan", "Mount Abu, Rajasthan",
  
  // Hill Stations
  "Ooty, Tamil Nadu", "Kodaikanal, Tamil Nadu", "Munnar, Kerala", "Coorg, Karnataka",
  "Darjeeling, West Bengal", "Gangtok, Sikkim", "Shillong, Meghalaya", "Mussoorie, Uttarakhand",
  "Nainital, Uttarakhand", "Kasauli, Himachal Pradesh", "Dalhousie, Himachal Pradesh",
  
  // Beach Destinations
  "Goa Beaches", "Varkala, Kerala", "Kovalam, Kerala", "Mahabalipuram, Tamil Nadu",
  "Puri, Odisha", "Digha, West Bengal", "Tarkarli, Maharashtra", "Alibaug, Maharashtra",
  "Gokarna, Karnataka", "Hampi, Karnataka",
  
  // Spiritual & Cultural Destinations
  "Amritsar, Punjab", "Mathura, Uttar Pradesh", "Vrindavan, Uttar Pradesh", "Tirupati, Andhra Pradesh",
  "Madurai, Tamil Nadu", "Rameswaram, Tamil Nadu", "Dwarka, Gujarat", "Somnath, Gujarat",
  "Ajmer, Rajasthan", "Bodh Gaya, Bihar", "Shirdi, Maharashtra", "Nashik, Maharashtra",
  
  // Adventure & Nature Destinations
  "Leh-Ladakh, Jammu & Kashmir", "Spiti Valley, Himachal Pradesh", "Valley of Flowers, Uttarakhand",
  "Jim Corbett National Park, Uttarakhand", "Ranthambore, Rajasthan", "Kaziranga, Assam",
  "Sundarbans, West Bengal", "Andaman & Nicobar Islands", "Lakshadweep Islands",
  
  // Modern Cities & Tech Hubs
  "Gurugram, Haryana", "Noida, Uttar Pradesh", "Chandigarh", "Kochi, Kerala",
  "Mysore, Karnataka", "Coimbatore, Tamil Nadu", "Thiruvananthapuram, Kerala"
];

// 3. Trip Type / Theme Options (Multi-select)
const tripThemeOptions = [
  { value: "heritage", label: "Heritage & Culture", icon: "🏛️" },
  { value: "spiritual", label: "Spiritual Journey", icon: "🕉️" },
  { value: "adventure", label: "Adventure & Trekking", icon: "🏔️" },

  { value: "culinary", label: "Culinary Discovery", icon: "🍴" },
  { value: "wildlife", label: "Wildlife & Nature Safari", icon: "🐾" },
  { value: "backwaters", label: "Backwaters & Nature", icon: "🛶" },
  { value: "royal", label: "Royal & Luxury Experiences", icon: "👑" },
  { value: "wellness", label: "Wellness & Ayurveda", icon: "🧘" },
  { value: "festivals", label: "Festivals & Celebrations", icon: "🎭" }
];

// 4. Group Type Options (Single select)
const groupTypeOptions = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "others", label: "Others" }
];

// 5. Budget Options (per person, INR)
const budgetOptions = [
  { value: "budget1", label: "< ₹5,000", description: "Budget-friendly local experiences" },
  { value: "budget2", label: "₹5,000–₹10,000", description: "Mid-range comfort and experiences" },
  { value: "budget3", label: "₹10,000–₹20,000", description: "Premium accommodations and activities" },
  { value: "budget4", label: "₹20,000+", description: "Luxury stays and exclusive experiences" }
];

// 6. Accommodation Type Options (Multi-select)
const accommodationOptions = [
  { value: "budget_hotels", label: "Budget Hotels" },
  { value: "midrange_hotels", label: "Mid-Range Hotels" },
  { value: "luxury_hotels", label: "Luxury Hotels / Resorts" },
  { value: "boutique_hotels", label: "Boutique Hotels" },
  { value: "guesthouses", label: "Guesthouses / Homestays" },
  { value: "hostels", label: "Hostels" }
];

// 7. Interests / Activities Options (Multi-select)
const interestOptions = [
  { value: "sightseeing", label: "Sightseeing & Monuments" },
  { value: "adventure_sports", label: "Adventure Sports" },
  { value: "nature_wildlife", label: "Nature & Wildlife" },
  { value: "shopping", label: "Shopping & Local Markets" },
  { value: "food_culinary", label: "Food & Culinary Experiences" },
  { value: "relaxation_spa", label: "Relaxation & Spa" },
  { value: "nightlife", label: "Nightlife & Entertainment" },
  { value: "photography", label: "Photography & Scenic Spots" }
];

// 8. Travel Pace Options (Single select)
const travelPaceOptions = [
  { value: "relaxed", label: "Relaxed", description: "1–2 activities per day" },
  { value: "balanced", label: "Balanced", description: "3–4 activities per day" },
  { value: "packed", label: "Packed", description: "5+ activities per day" }
];
const travelersOptions = [
  { value: "solo", label: "Solo", defaultCount: 1 },
  { value: "couple", label: "Couple", defaultCount: 2 },
  { value: "family", label: "Family", defaultCount: 4 },
  { value: "friends", label: "Friends", defaultCount: 3 }
];

// Duplicate tripThemeOptions definition removed - using the first definition above


// Duplicate definitions removed - using the definitions above

const transportOptions = [
  { value: "train", label: "Indian Railways", icon: Car },
  { value: "flight", label: "Domestic Flights", icon: Plane },
  { value: "private_car", label: "Private Car/Taxi", icon: Car },
  { value: "bus", label: "Bus (AC/Non-AC)", icon: Car },
  { value: "auto", label: "Auto-rickshaw", icon: Car },
  { value: "local_transport", label: "Local Transport", icon: Car }
];

// 3. Hotel Preferences Options (India-focused)
const hotelCategoryOptions = [
  { value: "budget", label: "Budget Hotels", description: "Clean, comfortable stay under ₹3,000/night" },
  { value: "heritage", label: "Heritage Hotels", description: "Former palaces & havelis with history" },
  { value: "business", label: "Business Hotels", description: "Modern amenities, city locations" },
  { value: "resort", label: "Resorts", description: "Beach/hill resorts with full facilities" },
  { value: "luxury", label: "Luxury Hotels", description: "5-star properties with world-class service" },
  { value: "homestay", label: "Homestays", description: "Authentic local family experiences" }
];

const locationPreferenceOptions = [
  { value: "city_center", label: "City Center", description: "Heart of the action" },
  { value: "near_attractions", label: "Near Attractions", description: "Close to must-see sights" },
  { value: "near_transport", label: "Near Transport", description: "Easy access to transportation" },
  { value: "quiet_area", label: "Quiet Area", description: "Peaceful, away from crowds" }
];

const mealPlanOptions = [
  { value: "room_only", label: "Room Only", description: "Explore local street food & restaurants" },
  { value: "breakfast", label: "Breakfast Included", description: "Traditional Indian/Continental breakfast" },
  { value: "veg_meals", label: "Vegetarian Meals", description: "Pure vegetarian breakfast + dinner" },
  { value: "all_meals", label: "All Meals", description: "Breakfast, lunch & dinner included" },
  { value: "jain_meals", label: "Jain Meals", description: "Jain vegetarian meals available" }
];

const amenitiesOptions = [
  { value: "wifi", label: "Free WiFi", icon: Wifi },
  { value: "ac", label: "Air Conditioning", icon: Heart },
  { value: "pool", label: "Swimming Pool", icon: Waves },
  { value: "spa", label: "Spa & Ayurveda", icon: Heart },
  { value: "parking", label: "Parking", icon: ParkingCircle },
  { value: "restaurant", label: "Multi-cuisine Restaurant", icon: Utensils },
  { value: "room_service", label: "24/7 Room Service", icon: MessageSquare },
  { value: "travel_desk", label: "Travel Desk", icon: Compass }
];

// 4. Activity Categories Options (India-focused)
const activityOptions = [
  { value: "temples", label: "Temples & Religious Sites", icon: "🕉️" },
  { value: "monuments", label: "Historical Monuments", icon: "🏛️" },
  { value: "food_tours", label: "Street Food & Local Cuisine", icon: "🍛" },
  { value: "markets", label: "Local Markets & Bazaars", icon: "🏪" },
  { value: "nature", label: "Hill Stations & Nature", icon: TreePine },
  { value: "wildlife", label: "Wildlife Safaris", icon: "🐅" },
  { value: "adventure", label: "Trekking & Adventure", icon: Compass },
  { value: "beaches", label: "Beaches & Water Activities", icon: "🏖️" },
  { value: "festivals", label: "Local Festivals & Events", icon: "🎭" },
  { value: "wellness", label: "Ayurveda & Wellness", icon: "🧘‍♀️" }, // Fix wellness emoji
  { value: "photography", label: "Photography Tours", icon: Camera },
  { value: "village_tours", label: "Village & Rural Tours", icon: "🏚️" }
];

// Add type for watchTravelers
type TravelersType = string | undefined;

export default function TripWizardForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  // Check if user is new
  const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const isNewUser = userData.isNewUser === true;
  const userName = userData.firstName || userData.fullName?.split(' ')[0] || 'Traveler';

  // Update form defaultValues to match schema
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: "",
      startDate: "",
      endDate: "",
      travelers: "",
      numberOfTravelers: 1,
      tripTheme: [],
      travelPace: "",
      budgetPerPerson: "",
      preferredTransport: [],
      hotelCategory: "",
      locationPreference: "",
      mealPlan: "",
      keyAmenities: [],
      activityCategories: [],
      specialNotes: "",
    },
  });

  // Filter destinations based on search
  const filteredDestinations = indianDestinations.filter(dest =>
    dest.toLowerCase().includes(destinationSearch.toLowerCase())
  ).slice(0, 10);

  // Auto-update number of travelers based on travel type
  const watchTravelers: TravelersType = form.watch("travelers");
  const updateTravelerCount = (travelType: string) => {
    const option = travelersOptions.find(opt => opt.value === travelType);
    if (option) {
      form.setValue("numberOfTravelers", option.defaultCount);
    }
  };

  // Calculate form progress
  const calculateProgress = () => {
    const watchedFields = form.watch();
    const requiredFields = [
      'destination', 'startDate', 'endDate', 'travelers', 'tripTheme',
      'travelPace', 'budgetPerPerson', 'preferredTransport', 'hotelCategory',
      'locationPreference', 'mealPlan', 'activityCategories'
    ] as const;
    
    let filledFields = 0;
    requiredFields.forEach(field => {
      const value = watchedFields[field];
      if (Array.isArray(value) ? value.length > 0 : value) {
        filledFields++;
      }
    });
    
    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const generateItinerary = useMutation({
    mutationFn: async (data: TripFormData) => {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await apiRequest("POST", "/api/generate-itinerary", data);
      const result = await response.json();
      return result;
    },
    onSuccess: (response) => {
      setIsGenerating(false);
      toast({
        title: "Itinerary Generated! ✨",
        description: "Your personalized travel plan is ready!",
      });
      setLocation("/itinerary");
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Error generating itinerary:", error);
      toast({
        title: "Generation Failed",
        description: "Please try again or adjust your preferences.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TripFormData) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      form.setError("endDate", {
        type: "manual",
        message: "End date must be after start date"
      });
      return;
    }

    // Mark user as no longer new after they submit their first trip
    if (isNewUser) {
      const updatedUserData = { ...userData, isNewUser: false };
      localStorage.setItem('userProfile', JSON.stringify(updatedUserData));
    }

    generateItinerary.mutate(data);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-2xl max-w-5xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-3 text-4xl">
          <Sparkles className="w-10 h-10 text-purple-600" />
          {isNewUser ? `Welcome ${userName}! Let's Plan Your First India Trip` : "Plan Your Perfect India Trip"}
        </CardTitle>
        <p className="text-gray-600 text-xl mt-2">
          {isNewUser 
            ? "Discover the incredible diversity of India - from the Himalayas to beaches, from bustling cities to serene villages"
            : "Explore India's rich culture, heritage, and natural beauty with our comprehensive trip planner"
          }
        </p>
        
        {isNewUser && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mt-4">
            <p className="text-blue-800">
              🇮🇳 <strong>Welcome to India's premier travel planner!</strong> We'll help you discover the best of India, from majestic palaces to pristine beaches!
            </p>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Form Progress</span>
            <span className="text-sm font-semibold text-purple-600">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-3 bg-gray-200" />
        </div>
      </CardHeader>

      <CardContent className="space-y-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            
            {/* 1. Trip Basics Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                <MapPin className="w-7 h-7 text-blue-600" />
                1. Trip Basics
              </div>
              
              {/* Destination with Autocomplete */}
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      Destination *
                    </FormLabel>
                    <FormDescription>Search for any city or country worldwide</FormDescription>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Type to search Indian destinations... (e.g., Mumbai, Goa, Kerala)"
                          value={destinationSearch}
                          onChange={(e) => {
                            setDestinationSearch(e.target.value);
                            field.onChange(e.target.value);
                            setShowDestinationDropdown(true);
                          }}
                          onFocus={() => setShowDestinationDropdown(true)}
                          onBlur={() => {
                            setTimeout(() => setShowDestinationDropdown(false), 200);
                          }}
                          className="h-14 text-lg pr-10 border-2 border-gray-200 focus:border-blue-400"
                        />
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        
                        {showDestinationDropdown && filteredDestinations.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                            {filteredDestinations.map((dest, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setDestinationSearch(dest);
                                  field.onChange(dest);
                                  setShowDestinationDropdown(false);
                                }}
                                className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <MapPin className="w-4 h-4 text-blue-400 mr-3 flex-shrink-0" />
                                <span className="font-medium text-gray-900">{dest}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Travel Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        Start Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-14 text-lg border-2 border-gray-200 focus:border-green-400"
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
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        End Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={form.watch('startDate') || new Date().toISOString().split('T')[0]}
                          className="h-14 text-lg border-2 border-gray-200 focus:border-green-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Travelers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="travelers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Travelers *
                      </FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        updateTravelerCount(value);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-purple-400">
                            <SelectValue placeholder="Select travel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {travelersOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfTravelers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Number of Travelers *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          className="h-14 text-lg border-2 border-gray-200 focus:border-purple-400"
                          disabled={!watchTravelers}
                        />
                      </FormControl>
                      <FormDescription>
                        Automatically set based on travel type (you can adjust)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Trip Theme (Multi-select) */}
              <FormField
                control={form.control}
                name="tripTheme" // Change from tripTheme to tripThemes to match schema
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Trip Type / Theme * (Multi-select)
                    </FormLabel>
                    <FormDescription>
                      Select all themes that match your trip vision
                    </FormDescription>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {tripThemeOptions.map((theme) => (
                          <label
                            key={theme.value}
                            className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-red-300"
                          >
                            <Checkbox
                              checked={field.value?.includes(theme.value) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                const updated = checked
                                  ? [...current, theme.value]
                                  : current.filter(item => item !== theme.value);
                                field.onChange(updated);
                              }}
                            />
                            <span className="text-2xl">{theme.icon}</span>
                            <span className="font-semibold text-gray-700">{theme.label}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* 2. Travel Preferences Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                <Clock className="w-7 h-7 text-orange-600" />
                2. Travel Preferences
              </div>
              
              {/* Travel Pace */}
              <FormField
                control={form.control}
                name="travelPace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Travel Pace *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-orange-400">
                          <SelectValue placeholder="How fast-paced should your trip be?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {travelPaceOptions.map((pace) => (
                          <SelectItem key={pace.value} value={pace.value}>
                            <div className="flex flex-col">
                              <span className="font-semibold">{pace.label}</span>
                              <span className="text-sm text-gray-500">{pace.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget per Person */}
              <FormField
                control={form.control}
                name="budgetPerPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Budget per Person *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-green-400">
                          <SelectValue placeholder="Select your budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetOptions.map((budget) => (
                          <SelectItem key={budget.value} value={budget.value}>
                            <div className="flex flex-col">
                              <span className="font-semibold">{budget.label}</span>
                              <span className="text-sm text-gray-500">{budget.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Transport (Multi-select) */}
              <FormField
                control={form.control}
                name="preferredTransport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-500" />
                      Preferred Transport * (Multi-select)
                    </FormLabel>
                    <FormDescription>
                      Select all transport modes you're comfortable with
                    </FormDescription>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                        {transportOptions.map((transport) => {
                          const Icon = transport.icon;
                          return (
                            <label
                              key={transport.value}
                              className="flex items-center space-x-2 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-blue-300"
                            >
                              <Checkbox
                                checked={field.value?.includes(transport.value) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  const updated = checked
                                    ? [...current, transport.value]
                                    : current.filter(item => item !== transport.value);
                                  field.onChange(updated);
                                }}
                              />
                              <Icon className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-sm text-gray-700">{transport.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* 3. Hotel Preferences Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                <Hotel className="w-7 h-7 text-purple-600" />
                3. Hotel Preferences
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hotel Category */}
                <FormField
                  control={form.control}
                  name="hotelCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Hotel Category *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-purple-400">
                            <SelectValue placeholder="Select hotel category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hotelCategoryOptions.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex flex-col">
                                <span className="font-semibold">{category.label}</span>
                                <span className="text-sm text-gray-500">{category.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Preference */}
                <FormField
                  control={form.control}
                  name="locationPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Location Preference *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-purple-400">
                            <SelectValue placeholder="Where would you like to stay?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locationPreferenceOptions.map((location) => (
                            <SelectItem key={location.value} value={location.value}>
                              <div className="flex flex-col">
                                <span className="font-semibold">{location.label}</span>
                                <span className="text-sm text-gray-500">{location.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Meal Plan */}
              <FormField
                control={form.control}
                name="mealPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-orange-500" />
                      Meal Plan *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-orange-400">
                          <SelectValue placeholder="Select meal plan preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mealPlanOptions.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            <div className="flex flex-col">
                              <span className="font-semibold">{plan.label}</span>
                              <span className="text-sm text-gray-500">{plan.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Key Amenities (Multi-select) */}
              <FormField
                control={form.control}
                name="keyAmenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Key Amenities (Multi-select)
                    </FormLabel>
                    <FormDescription>
                      Select amenities that are important to you
                    </FormDescription>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {amenitiesOptions.map((amenity) => {
                          const Icon = amenity.icon;
                          return (
                            <label
                              key={amenity.value}
                              className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-purple-300"
                            >
                              <Checkbox
                                checked={field.value?.includes(amenity.value) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  const updated = checked
                                    ? [...current, amenity.value]
                                    : current.filter(item => item !== amenity.value);
                                  field.onChange(updated);
                                }}
                              />
                              <Icon className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-gray-700">{amenity.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* 4. Interests/Activities Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                <Heart className="w-7 h-7 text-red-600" />
                4. Interests / Activities
              </div>
              
              <FormField
                control={form.control}
                name="activityCategories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Activity Categories * (Multi-select)
                    </FormLabel>
                    <FormDescription>
                      Select all activities you'd like to experience during your trip
                    </FormDescription>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {activityOptions.map((activity) => {
                          return (
                            <label
                              key={activity.value}
                              className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-red-300"
                            >
                              <Checkbox
                                checked={field.value?.includes(activity.value) || false}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  const updated = checked
                                    ? [...current, activity.value]
                                    : current.filter(item => item !== activity.value);
                                  field.onChange(updated);
                                }}
                              />
                              {typeof activity.icon === 'string' ? (
                                <span className="text-2xl">{activity.icon}</span>
                              ) : (
                                <activity.icon className="w-6 h-6 text-red-600" />
                              )}
                              <span className="font-semibold text-gray-700">{activity.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* 5. Special Requests Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                <MessageSquare className="w-7 h-7 text-indigo-600" />
                5. Special Requests / Notes (Optional)
              </div>
              
              <FormField
                control={form.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Notes
                    </FormLabel>
                    <FormDescription>
                      Any accessibility requirements, must-do activities, things to avoid, or other personal preferences
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Pure vegetarian meals only, need wheelchair accessibility, want to experience local festivals, interested in Ayurvedic treatments, prefer AC transport due to heat, must visit specific temples..."
                        className="min-h-[120px] text-lg border-2 border-gray-200 focus:border-indigo-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Submit Button */}
            <div className="pt-10 border-t-2 border-gray-200">
              <Button
                type="submit"
                disabled={isGenerating || calculateProgress() < 100}
                className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 hover:from-purple-700 hover:via-blue-700 hover:to-green-700 disabled:opacity-50 shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-10 h-10 mr-4 animate-spin" />
                    Generating Your Perfect Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-10 h-10 mr-4" />
                    Generate My India Itinerary ✨
                  </>
                )}
              </Button>
              
              {calculateProgress() < 100 && (
                <p className="text-center text-gray-500 mt-4 text-lg">
                  Please complete all required fields to generate your itinerary ({calculateProgress()}% completed)
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}