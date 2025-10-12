import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, ArrowRight, Sparkles, Wifi, Car, Utensils, Droplets, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Hotel } from "@shared/schema";

export default function HotelPreviewSection() {
  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });

  if (isLoading) {
    return (
      <section id="hotels" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="travel-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Hotel Recommendations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of hotel discovery
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse bg-gray-200 rounded-3xl h-96"></div>
          </div>
        </div>
      </section>
    );
  }

  // Get the first hotel for the preview
  const featuredHotel = hotels?.[0];

  return (
    <section id="hotels" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="travel-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Hotel Recommendations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            See how our intelligent system finds your perfect accommodation
          </p>
          
          {/* How it works badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
              <Brain className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium">AI Analysis</span>
            </div>
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
              <Zap className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium">Instant Matching</span>
            </div>
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
              <Sparkles className="w-5 h-5 text-pink-600 mr-2" />
              <span className="text-sm font-medium">Personalized</span>
            </div>
          </div>
        </div>

        {featuredHotel ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Single Featured Hotel Card */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-105 transition-all duration-500">
                <div className="grid md:grid-cols-1 gap-0">
                  {/* Hotel Image */}
                  <div className="h-64 md:h-80 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                      alt="Luxury hotel with beautiful architecture and swimming pool"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white font-semibold">
                        AI Recommended
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {featuredHotel.rating} Rating
                        </Badge>
                        <div className="text-white">
                          <div className="text-2xl font-bold">₹{featuredHotel.pricePerNight}</div>
                          <div className="text-sm opacity-80">per night</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {featuredHotel.name}
                    </h3>
                    
                    <p className="text-gray-600 flex items-center mb-4 text-lg">
                      <MapPin className="w-5 h-5 mr-2" />
                      {featuredHotel.location}
                    </p>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {featuredHotel.description}
                    </p>

                    {/* AI Insight */}
                    {featuredHotel.aiInsight && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-400">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-blue-900 mb-1">AI Insight</h5>
                            <p className="text-blue-800 text-sm">{featuredHotel.aiInsight}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {featuredHotel.amenities && Array.isArray(featuredHotel.amenities) && featuredHotel.amenities.length > 0 ? (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-3">Amenities</h5>
                        <div className="flex flex-wrap gap-2">
                          {(featuredHotel.amenities as string[]).map((amenity, i) => (
                            <Badge key={i} variant="outline" className="flex items-center gap-1 text-xs">
                              {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3" />}
                              {amenity.toLowerCase().includes('parking') && <Car className="w-3 h-3" />}
                              {amenity.toLowerCase().includes('restaurant') && <Utensils className="w-3 h-3" />}
                              {amenity.toLowerCase().includes('pool') && <Droplets className="w-3 h-3" />}
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Motivational Content */}
              <div className="bg-white rounded-3xl p-8 shadow-lg h-fit">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Want More Personalized Recommendations?
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  This is just one example! Our AI analyzes your preferences, budget, and travel style to find hotels that perfectly match your needs. Get instant recommendations for any destination worldwide.
                </p>
                
                <div className="grid gap-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Smart Analysis</h4>
                      <p className="text-gray-600 text-sm">AI understands your travel style and preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Instant Results</h4>
                      <p className="text-gray-600 text-sm">Get recommendations in seconds, not hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Perfect Match</h4>
                      <p className="text-gray-600 text-sm">Hotels tailored exactly to your needs</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/ai-recommendations">
                  <Button 
                    size="lg"
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Get My Hotel Recommendations
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <p className="text-gray-500 text-sm mt-4 text-center">
                  ✨ Free to use • No signup required • Instant results
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Loading hotel preview...</p>
          </div>
        )}
      </div>
    </section>
  );
}