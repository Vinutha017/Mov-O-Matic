import { useQuery } from "@tanstack/react-query";
import { Star, Lightbulb, MapPin, Wifi, Car, Utensils, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Hotel } from "@shared/schema";

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  restaurant: Utensils,
  pool: Droplets
};

export default function HotelRecommendations() {
  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });

  if (isLoading) {
    return (
      <section className="travel-section bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="travel-container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="travel-heading">AI-Powered Hotel Recommendations</h2>
            <p className="travel-subheading">Find perfect accommodations tailored to your style and budget</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-96"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="travel-section bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="travel-container">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="travel-heading">AI-Powered Hotel Recommendations</h2>
          <p className="travel-subheading">Find perfect accommodations tailored to your style and budget</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels?.slice(0, 3).map((hotel, index) => (
            <div 
              key={hotel.id} 
              className="group bg-white rounded-2xl shadow-lg overflow-hidden travel-card-hover border border-gray-100 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image with overlay */}
              <div className="relative overflow-hidden">
                <img 
                  src={Array.isArray(hotel.images) && hotel.images.length > 0 ? hotel.images[0] : "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"} 
                  alt={hotel.name} 
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Price badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-lg font-bold text-primary">₹{hotel.pricePerNight}</span>
                  <span className="text-xs text-gray-600">/night</span>
                </div>
                
                {/* Rating badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                  <span className="font-semibold text-gray-800">{hotel.rating}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hotel.location}</span>
                  </div>
                </div>
                
                {/* Amenities */}
                <div className="flex items-center gap-4 mb-4">
                  {Array.isArray(hotel.amenities) && hotel.amenities.slice(0, 4).map((amenity: string, idx: number) => {
                    const IconComponent = amenityIcons[amenity.toLowerCase() as keyof typeof amenityIcons] || Wifi;
                    return (
                      <div key={idx} className="flex items-center text-gray-500 text-sm">
                        <IconComponent className="w-4 h-4 mr-1" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* AI Insight */}
                {hotel.aiInsight && (
                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-xl mb-6 border border-blue-100">
                    <div className="flex items-center text-sm text-blue-800 mb-2">
                      <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-semibold">AI Insight</span>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed">{hotel.aiInsight}</p>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 travel-button">
                    Add to Itinerary
                  </Button>
                  <Button variant="outline" className="px-4">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12 animate-fade-in">
          <Button variant="outline" className="travel-button text-lg px-8 py-4">
            <span>🏨</span>
            <span className="ml-2">View All Hotels</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
