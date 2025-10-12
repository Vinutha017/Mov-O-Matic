import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Destination } from "@shared/schema";

export default function DestinationsShowcase() {
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations", { popular: true }],
  });

  if (isLoading) {
    return (
      <section id="destinations" className="travel-section bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="travel-container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="travel-heading">Popular Destinations</h2>
            <p className="travel-subheading">Discover amazing places with AI-crafted itineraries</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="destinations" className="travel-section bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="travel-container">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="travel-heading">Popular Destinations</h2>
          <p className="travel-subheading">Discover amazing places with AI-crafted itineraries</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations?.map((destination, index) => (
            <div 
              key={destination.id} 
              className="group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <img 
                  src={destination.image || "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500"} 
                  alt={`${destination.name}, ${destination.country}`} 
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {destination.category}
                  </span>
                </div>
                
                {/* Rating badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                    {destination.rating}
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-300 transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-sm opacity-90 mb-3 line-clamp-2">
                    {destination.description}
                  </p>
                  
                  {/* Additional info */}
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{destination.country}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>3-5 days</span>
                    </div>
                  </div>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 animate-fade-in">
          <Button className="travel-button text-lg px-8 py-4">
            <span className="text-xl mr-2">🌍</span>
            <span>Explore All Destinations</span>
          </Button>
        </div>
      </div>
    </section>
  );
}