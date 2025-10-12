import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Hotel, 
  MapPin, 
  Star, 
  DollarSign, 
  Clock, 
  Users, 
  Heart,
  TrendingUp,
  Eye,
  MessageSquare,
  ArrowRight,
  Loader2
} from "lucide-react";

const recommendationSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  budget: z.string().min(1, "Budget is required"),
  travelStyle: z.string().min(1, "Travel style is required"),
  interests: z.string().min(1, "Interests are required"),
  amenities: z.string().optional(),
  travelers: z.string().min(1, "Number of travelers is required"),
  duration: z.string().min(1, "Duration is required"),
});

type RecommendationFormData = z.infer<typeof recommendationSchema>;

const travelStyles = [
  { value: "luxury", label: "Luxury" },
  { value: "budget", label: "Budget" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
  { value: "relaxation", label: "Relaxation" },
  { value: "family", label: "Family" },
  { value: "romantic", label: "Romantic" },
  { value: "backpacker", label: "Backpacker" }
];

export default function AIRecommendations() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hotels");
  const [isLoading, setIsLoading] = useState(false);
  const [hotelRecommendations, setHotelRecommendations] = useState<any[]>([]);
  const [hiddenGems, setHiddenGems] = useState<any[]>([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);

  const form = useForm<RecommendationFormData>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      destination: "",
      budget: "",
      travelStyle: "cultural",
      interests: "",
      amenities: "",
      travelers: "2",
      duration: "7",
    },
  });

  const getHotelRecommendationsMutation = useMutation({
    mutationFn: async (data: RecommendationFormData) => {
      console.log("Sending hotel recommendation request:", data);
      const response = await apiRequest("POST", "/api/ai/hotel-recommendations", {
        destination: data.destination,
        budget: parseInt(data.budget),
        travelStyle: data.travelStyle,
        interests: data.interests.split(",").map(i => i.trim()),
        amenities: data.amenities ? data.amenities.split(",").map(a => a.trim()) : [],
        travelers: parseInt(data.travelers)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Hotel recommendations response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Hotel recommendations success:", data);
      setHotelRecommendations(data.hotels || []);
      setIsLoading(false);
      toast({
        title: "AI Recommendations Generated!",
        description: `Found ${data.hotels?.length || 0} personalized hotel recommendations for you.`,
      });
    },
    onError: (error) => {
      console.error("Hotel recommendations error details:", error);
      setIsLoading(false);
      toast({
        title: "Failed to Generate Recommendations",
        description: error instanceof Error ? error.message : "There was an error generating AI recommendations. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getHiddenGemsMutation = useMutation({
    mutationFn: async (data: RecommendationFormData) => {
      console.log("Sending hidden gems request:", data);
      
      // Create the request payload
      const payload = {
        destination: data.destination,
        interests: data.interests.split(",").map(i => i.trim()),
        budget: parseInt(data.budget),
        travelStyle: data.travelStyle,
        duration: parseInt(data.duration)
      };
      
      console.log("Request payload:", payload);
      console.log("JSON stringified payload:", JSON.stringify(payload));
      
      const response = await apiRequest("POST", "/api/ai/hidden-gems", payload);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Hidden gems response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Hidden gems success:", data);
      setHiddenGems(data.hiddenGems || []);
      setIsLoading(false);
      toast({
        title: "Hidden Gems Discovered!",
        description: `Found ${data.hiddenGems?.length || 0} amazing hidden gems for you.`,
      });
    },
    onError: (error) => {
      console.error("Hidden gems error details:", error);
      setIsLoading(false);
      toast({
        title: "Failed to Discover Hidden Gems",
        description: error instanceof Error ? error.message : "There was an error discovering hidden gems. Please try again.",
        variant: "destructive",
      });
    }
  });

  const analyzeSentimentMutation = useMutation({
    mutationFn: async (reviews: string[]) => {
      const response = await apiRequest("POST", "/api/ai/analyze-sentiment", { reviews });
      return response.json();
    },
    onSuccess: (data) => {
      setSentimentAnalysis(data);
      setIsLoading(false);
      toast({
        title: "Sentiment Analysis Complete!",
        description: "AI has analyzed the reviews and provided insights.",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Failed to Analyze Sentiment",
        description: "There was an error analyzing sentiment. Please try again.",
        variant: "destructive",
      });
      console.error("Sentiment analysis error:", error);
    }
  });

  const onSubmit = (data: RecommendationFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Active tab:", activeTab);
    
    // Validate required fields
    if (!data.destination || !data.budget || !data.travelStyle || !data.interests) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    if (activeTab === "hotels") {
      console.log("Submitting hotel recommendations request");
      getHotelRecommendationsMutation.mutate(data);
    } else if (activeTab === "hidden-gems") {
      console.log("Submitting hidden gems request");
      getHiddenGemsMutation.mutate(data);
    }
  };

  const handleSentimentAnalysis = () => {
    const sampleReviews = [
      "Amazing hotel with excellent service and beautiful rooms!",
      "The location is perfect and the staff is very friendly.",
      "Great value for money, highly recommended!",
      "The food was delicious and the amenities were top-notch.",
      "Perfect for families, kids loved the pool area."
    ];
    
    setIsLoading(true);
    analyzeSentimentMutation.mutate(sampleReviews);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hotels" className="flex items-center">
                <Hotel className="w-4 h-4 mr-2" />
                Hotel Picks
              </TabsTrigger>
              <TabsTrigger value="hidden-gems" className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Hidden Gems
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Sentiment Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hotels" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Jaipur, Rajasthan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget per Night (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="travelStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Style *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {travelStyles.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
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
                      name="travelers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Travelers *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interests (comma-separated) *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., culture, food, history, shopping" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Amenities (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., WiFi, Pool, Spa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full travel-button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Recommendations...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Hotel Recommendations
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Hotel Recommendations Display */}
              {hotelRecommendations.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Personalized Hotel Recommendations</h3>
                  <div className="grid gap-4">
                    {hotelRecommendations.map((hotel, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{hotel.name}</h4>
                              <p className="text-sm text-gray-600">{hotel.location}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary">₹{hotel.pricePerNight}</div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                                {hotel.rating}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{hotel.description}</p>
                          
                          <div className="mb-3">
                            <h5 className="font-medium text-sm mb-2">AI Insight:</h5>
                            <p className="text-sm text-primary bg-primary/10 p-2 rounded">{hotel.aiInsight}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {hotel.amenities?.map((amenity: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-medium text-green-600">Pros:</h6>
                              <ul className="text-gray-600">
                                {hotel.pros?.slice(0, 2).map((pro: string, idx: number) => (
                                  <li key={idx}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-red-600">Cons:</h6>
                              <ul className="text-gray-600">
                                {hotel.cons?.slice(0, 2).map((con: string, idx: number) => (
                                  <li key={idx}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-3 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-800">
                              <strong>Local Tip:</strong> {hotel.localTips}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="hidden-gems" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Jaipur, Rajasthan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (days) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="7" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Budget (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="travelStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Style *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {travelStyles.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interests (comma-separated) *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., culture, food, history, shopping" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full travel-button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Discovering Hidden Gems...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Discover Hidden Gems
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Hidden Gems Display */}
              {hiddenGems.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Hidden Gems & Local Secrets</h3>
                  <div className="grid gap-4">
                    {hiddenGems.map((gem, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{gem.title}</h4>
                              <p className="text-sm text-gray-600">{gem.location}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">₹{gem.cost}</div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {gem.duration} min
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{gem.description}</p>
                          
                          <div className="mb-3">
                            <h5 className="font-medium text-sm mb-2">Why It's Hidden:</h5>
                            <p className="text-sm text-gray-600">{gem.whyHidden}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <h6 className="font-medium text-blue-600">Local Insight:</h6>
                              <p className="text-gray-600">{gem.localInsight}</p>
                            </div>
                            <div>
                              <h6 className="font-medium text-green-600">Best Time:</h6>
                              <p className="text-gray-600">{gem.bestTimeToVisit}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              {gem.crowdLevel} Crowd
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Heart className="w-3 h-3 mr-1" />
                              {gem.authenticity} Authentic
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Photo Op
                            </Badge>
                          </div>

                          <div className="mt-3 p-2 bg-yellow-50 rounded">
                            <p className="text-xs text-yellow-800">
                              <strong>Photo Opportunity:</strong> {gem.photoOpportunity}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-4">Review Sentiment Analysis</h3>
                <p className="text-gray-600 mb-6">
                  AI analyzes reviews to provide insights about what travelers love and areas for improvement.
                </p>
                <Button 
                  onClick={handleSentimentAnalysis}
                  disabled={isLoading}
                  className="travel-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Reviews...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Analyze Sample Reviews
                    </>
                  )}
                </Button>
              </div>

              {/* Sentiment Analysis Results */}
              {sentimentAnalysis && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Sentiment Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Overall Sentiment:</span>
                        <Badge 
                          variant={sentimentAnalysis.overallSentiment === 'positive' ? 'default' : 
                                  sentimentAnalysis.overallSentiment === 'negative' ? 'destructive' : 'secondary'}
                        >
                          {sentimentAnalysis.overallSentiment}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Sentiment Score:</span>
                        <span className="text-lg font-bold text-primary">
                          {(sentimentAnalysis.sentimentScore * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Key Insights:</h4>
                        <ul className="space-y-1">
                          {sentimentAnalysis.keyInsights?.map((insight: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Common Themes:</h4>
                        <div className="flex flex-wrap gap-2">
                          {sentimentAnalysis.commonThemes?.map((theme: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {sentimentAnalysis.recommendations?.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <ArrowRight className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 