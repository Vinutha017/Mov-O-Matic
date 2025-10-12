import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Star, Wifi, Car, Utensils, Droplets, Heart, Lightbulb, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Hotel } from "@shared/schema";

interface RecommendationForm {
  destination: string;
  budget: number;
  travelStyle: string;
  interests: string[];
  amenities: string[];
  travelers: number;
}

const travelStyles = [
  { value: "luxury", label: "Luxury", description: "Premium experiences and accommodations" },
  { value: "adventure", label: "Adventure", description: "Thrilling activities and exploration" },
  { value: "cultural", label: "Cultural", description: "Heritage sites and local experiences" },
  { value: "family", label: "Family", description: "Family-friendly activities and comfort" },
  { value: "budget", label: "Budget", description: "Cost-effective travel options" },
  { value: "romantic", label: "Romantic", description: "Couples and romantic getaways" }
];

const interests = [
  { id: "culture", label: "Culture & History" },
  { id: "food", label: "Food & Cuisine" },
  { id: "nature", label: "Nature & Wildlife" },
  { id: "adventure", label: "Adventure Sports" },
  { id: "relaxation", label: "Relaxation & Spa" },
  { id: "nightlife", label: "Nightlife & Entertainment" },
  { id: "shopping", label: "Shopping" },
  { id: "photography", label: "Photography" }
];

const amenities = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "pool", label: "Swimming Pool", icon: Droplets },
  { id: "parking", label: "Free Parking", icon: Car },
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "gym", label: "Fitness Center", icon: Heart },
  { id: "spa", label: "Spa & Wellness", icon: Sparkles }
];

const getAmenityIcon = (amenityId: string) => {
  const amenity = amenities.find(a => a.id === amenityId);
  return amenity?.icon || Wifi;
};

export default function AIRecommendationsForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RecommendationForm>({
    destination: "",
    budget: 5000,
    travelStyle: "",
    interests: [],
    amenities: [],
    travelers: 2
  });

  // Separate state for input values to allow free typing
  const [budgetInput, setBudgetInput] = useState("5000");
  const [travelersInput, setTravelersInput] = useState("2");

  const [recommendations, setRecommendations] = useState<Hotel[]>([]);

  const recommendationsMutation = useMutation({
    mutationFn: async (data: RecommendationForm) => {
      const response = await fetch("/api/ai/hotel-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to get recommendations");
      return response.json();
    },
    onSuccess: (data: { hotels: Hotel[] }) => {
      setRecommendations(data.hotels || []);
      toast({
        title: "✨ AI Recommendations Ready!",
        description: `Found ${data.hotels?.length || 0} personalized hotel recommendations for ${formData.destination}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Getting Recommendations",
        description: "Please try again with different parameters",
        variant: "destructive",
      });
    },
  });

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setFormData((prev: RecommendationForm) => ({
      ...prev,
      interests: checked
        ? [...prev.interests, interestId]
        : prev.interests.filter((id: string) => id !== interestId)
    }));
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter(id => id !== amenityId)
    }));
  };

  // Improved input handlers
  const handleBudgetChange = (value: string) => {
    setBudgetInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData(prev => ({ ...prev, budget: numValue }));
    }
  };

  const handleBudgetBlur = () => {
    const numValue = parseInt(budgetInput);
    if (isNaN(numValue) || numValue < 1000) {
      setBudgetInput("5000");
      setFormData(prev => ({ ...prev, budget: 5000 }));
      toast({
        title: "Budget Adjusted",
        description: "Budget set to minimum ₹5,000. You can adjust it as needed.",
      });
    } else if (numValue > 100000) {
      setBudgetInput("100000");
      setFormData(prev => ({ ...prev, budget: 100000 }));
      toast({
        title: "Budget Adjusted",
        description: "Budget set to maximum ₹1,00,000. You can adjust it as needed.",
      });
    }
  };

  const handleTravelersChange = (value: string) => {
    setTravelersInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 10) {
      setFormData(prev => ({ ...prev, travelers: numValue }));
    }
  };

  const handleTravelersBlur = () => {
    const numValue = parseInt(travelersInput);
    if (isNaN(numValue) || numValue < 1) {
      setTravelersInput("2");
      setFormData(prev => ({ ...prev, travelers: 2 }));
    } else if (numValue > 10) {
      setTravelersInput("10");
      setFormData(prev => ({ ...prev, travelers: 10 }));
      toast({
        title: "Travelers Adjusted",
        description: "Maximum 10 travelers allowed. For larger groups, please contact us directly.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      toast({
        title: "Missing Destination",
        description: "Please enter a destination to get recommendations",
        variant: "destructive",
      });
      return;
    }
    recommendationsMutation.mutate(formData);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="travel-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 AI-Powered Hotel Recommendations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized hotel recommendations powered by Google Gemini AI. Just tell us your preferences and let AI find your perfect stay!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Tell Us Your Preferences
              </CardTitle>
              <CardDescription className="text-base">
                Fill out this form and watch AI magic happen!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Destination */}
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Delhi, Mumbai, Goa, Jaipur..."
                    value={formData.destination}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    className="text-base"
                  />
                </div>

                {/* Budget and Travelers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-base font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Budget (₹/night)
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      min="1000"
                      max="100000"
                      step="1000"
                      value={budgetInput}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                      onBlur={handleBudgetBlur}
                      className="text-base"
                      placeholder="Enter budget per night"
                    />
                    <div className="text-xs text-gray-500">
                      Range: ₹1,000 - ₹1,00,000 per night
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="travelers" className="text-base font-semibold">
                      Travelers
                    </Label>
                    <Input
                      id="travelers"
                      type="number"
                      min="1"
                      max="10"
                      value={travelersInput}
                      onChange={(e) => handleTravelersChange(e.target.value)}
                      onBlur={handleTravelersBlur}
                      className="text-base"
                      placeholder="Number of travelers"
                    />
                    <div className="text-xs text-gray-500">
                      Maximum 10 travelers
                    </div>
                  </div>
                </div>

                {/* Travel Style */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Travel Style</Label>
                  <Select value={formData.travelStyle} onValueChange={(value: string) => setFormData((prev: RecommendationForm) => ({ ...prev, travelStyle: value }))}>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Choose your travel style" />
                    </SelectTrigger>
                    <SelectContent>
                      {travelStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Your Interests</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {interests.map((interest) => (
                      <div key={interest.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest.id}
                          checked={formData.interests.includes(interest.id)}
                          onCheckedChange={(checked) => handleInterestChange(interest.id, checked as boolean)}
                        />
                        <Label htmlFor={interest.id} className="text-sm cursor-pointer">
                          {interest.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Preferred Amenities</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity.id}
                            checked={formData.amenities.includes(amenity.id)}
                            onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                          />
                          <Label htmlFor={amenity.id} className="text-sm cursor-pointer flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {amenity.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={recommendationsMutation.isPending}
                >
                  {recommendationsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get AI Recommendations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  AI Recommendations for {formData.destination}
                </h3>
                {recommendations.map((hotel, index) => (
                  <Card key={hotel.id} className="shadow-lg hover:shadow-xl transition-shadow bg-white border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{hotel.name}</h4>
                          <p className="text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {hotel.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{hotel.rating}</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-600">
                            ₹{hotel.pricePerNight}
                            <span className="text-sm text-gray-500 font-normal">/night</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{hotel.description}</p>

                      {hotel.aiInsight && (
                        <div className="bg-purple-50 rounded-lg p-4 mb-4 border-l-4 border-purple-400">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h5 className="font-semibold text-purple-900 mb-1">AI Insight</h5>
                              <p className="text-purple-800 text-sm">{hotel.aiInsight}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(hotel.amenities as string[]).map((amenity, i) => {
                            const Icon = getAmenityIcon(amenity.toLowerCase());
                            return (
                              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                <Icon className="w-3 h-3" />
                                {amenity}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {recommendationsMutation.isPending && (
              <Card className="shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">AI is Working Its Magic...</h3>
                  <p className="text-gray-600">
                    Analyzing your preferences and finding the perfect hotels in {formData.destination}
                  </p>
                </CardContent>
              </Card>
            )}

            {!recommendationsMutation.isPending && recommendations.length === 0 && (
              <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ready for AI Magic!</h3>
                  <p className="text-gray-600">
                    Fill out the form and get personalized hotel recommendations powered by Google Gemini AI
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}