import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AITripRequest, AIRecommendation, Activity, Hotel } from "@shared/schema";

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class AITravelPlanner {
  async generateTripItinerary(request: AITripRequest): Promise<AIRecommendation> {
    try {
      console.log("🌟 Using Google Gemini for trip generation");
      console.log("📝 Trip request:", JSON.stringify(request, null, 2));

      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const prompt = `Create a detailed travel itinerary in JSON format based on this request:

${request.description}

Details:
- Destination: ${request.destination || "as mentioned"}
- Duration: ${request.duration || "as mentioned"}
- Budget: ${request.budget ? `₹${request.budget}` : "as mentioned"}
- Travelers: ${request.travelers || 1}
- Travel Style: ${request.travelStyle || "mixed"}
- Interests: ${request.interests?.join(", ") || "general"}

Return ONLY a valid JSON object with this exact structure:
{
  "hotels": [
    {
      "name": "Hotel Name",
      "location": "Area/Location",
      "rating": "4.2",
      "pricePerNight": "3500",
      "amenities": ["WiFi", "Pool", "Restaurant"],
      "description": "Brief description",
      "aiInsight": "Why recommended for this traveler"
    }
  ],
  "attractions": [
    {
      "title": "Attraction Name",
      "description": "What to expect",
      "location": "Location",
      "cost": "500",
      "duration": 120,
      "category": "attraction"
    }
  ],
  "restaurants": [
    {
      "title": "Restaurant Name",
      "description": "Cuisine type and specialties", 
      "location": "Area",
      "cost": "800",
      "duration": 60,
      "category": "restaurant"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Day 1: Arrival & Exploration",
      "activities": [
        "Morning: Check-in at hotel",
        "Afternoon: Visit main attraction",
        "Evening: Local food tour"
      ]
    }
  ]
}

Focus on authentic experiences within the budget. Include practical pricing in Indian Rupees.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("✅ Gemini response received");
      console.log("📋 Response preview:", text.substring(0, 200) + "...");

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response from Gemini");
      }

      const aiRecommendation = JSON.parse(jsonMatch[0]);
      return aiRecommendation as AIRecommendation;

    } catch (error) {
      console.error("❌ Gemini AI Error:", error);
      
      // Fallback to smart location-based recommendations
      return this.generateSmartFallback(request);
    }
  }

  private generateSmartFallback(request: AITripRequest): AIRecommendation {
    const destination = request.destination || "India";
    const budget = request.budget || 15000;
    const isLuxury = budget > 20000;
    const isBudget = budget < 10000;

    console.log("🔄 Generating smart fallback for:", destination);

    return {
      hotels: [
        {
          id: "fallback-hotel-1",
          name: `${destination} ${isLuxury ? 'Palace Hotel' : isBudget ? 'Budget Inn' : 'Heritage Hotel'}`,
          location: `${destination} City Center`,
          address: `123 Main Street, ${destination}`,
          coordinates: null,
          rating: isLuxury ? "4.8" : isBudget ? "3.8" : "4.2",
          pricePerNight: Math.round(budget * 0.4).toString(),
          currency: "INR",
          amenities: isLuxury 
            ? ["WiFi", "Pool", "Spa", "Restaurant", "Gym"] 
            : isBudget 
            ? ["WiFi", "Restaurant"] 
            : ["WiFi", "Restaurant", "Room Service"],
          images: null,
          description: `A ${isLuxury ? 'luxury' : isBudget ? 'comfortable budget' : 'mid-range'} hotel in ${destination} perfect for ${request.travelStyle} travelers.`,
          aiInsight: `Great choice for ${request.travelStyle} travel style with ${request.interests?.join(' and ') || 'general'} interests. Well-located within your ₹${budget} budget.`,
          bookingUrl: null
        }
      ],
      attractions: this.getLocationAttractions(destination, request.interests || []),
      restaurants: this.getLocationRestaurants(destination, request.interests || []),
      itinerary: [
        {
          day: 1,
          activities: [
            {
              id: "activity-1-1",
              dayId: "day-1",
              title: "Hotel Check-in",
              description: "Arrive and check-in to hotel",
              location: `${destination} City Center`,
              address: null,
              coordinates: null,
              startTime: "14:00",
              endTime: "15:00",
              duration: 60,
              cost: "0",
              category: "accommodation",
              priority: 1,
              bookingUrl: null,
              notes: "Standard check-in time",
              sortOrder: 1
            },
            {
              id: "activity-1-2",
              dayId: "day-1",
              title: "City Center Exploration",
              description: `Explore ${destination} city center`,
              location: `${destination} City Center`,
              address: null,
              coordinates: null,
              startTime: "16:00",
              endTime: "18:00",
              duration: 120,
              cost: "200",
              category: "sightseeing",
              priority: 2,
              bookingUrl: null,
              notes: "Walking tour of main attractions",
              sortOrder: 2
            },
            {
              id: "activity-1-3",
              dayId: "day-1",
              title: "Traditional Dinner",
              description: "Traditional local dinner",
              location: `${destination} Restaurant District`,
              address: null,
              coordinates: null,
              startTime: "19:00",
              endTime: "21:00",
              duration: 120,
              cost: "800",
              category: "restaurant",
              priority: 3,
              bookingUrl: null,
              notes: "Try local specialties",
              sortOrder: 3
            }
          ],
          estimatedCost: 1000
        }
      ],
      totalEstimatedCost: budget,
      tips: [
        `Best time to visit ${destination} is early morning or late afternoon`,
        "Try local street food for authentic flavors",
        "Carry cash as some local vendors may not accept cards"
      ]
    };
  }

  private getLocationAttractions(destination: string, interests: string[]): any[] {
    const culturalInterests = interests.some(i => i.toLowerCase().includes('culture') || i.toLowerCase().includes('history'));
    const foodInterests = interests.some(i => i.toLowerCase().includes('food'));
    
    // Location-specific attractions
    const attractions = [];
    
    if (destination.toLowerCase().includes('delhi')) {
      attractions.push(
        { title: "Red Fort", description: "Historic Mughal fort complex", location: "Old Delhi", cost: "50", duration: 120, category: "attraction" },
        { title: "India Gate", description: "War memorial and iconic landmark", location: "Central Delhi", cost: "0", duration: 60, category: "attraction" }
      );
    } else if (destination.toLowerCase().includes('mumbai')) {
      attractions.push(
        { title: "Gateway of India", description: "Iconic monument overlooking the harbor", location: "Colaba", cost: "0", duration: 60, category: "attraction" },
        { title: "Marine Drive", description: "Famous waterfront promenade", location: "South Mumbai", cost: "0", duration: 90, category: "attraction" }
      );
    } else if (destination.toLowerCase().includes('jaipur')) {
      attractions.push(
        { title: "Hawa Mahal", description: "Palace of Winds with intricate architecture", location: "Old City", cost: "200", duration: 90, category: "attraction" },
        { title: "City Palace", description: "Royal palace complex with museums", location: "City Center", cost: "500", duration: 150, category: "attraction" }
      );
    } else {
      // Generic attractions
      attractions.push(
        { title: `${destination} Historic Center`, description: "Main historical area to explore", location: "City Center", cost: "100", duration: 120, category: "attraction" },
        { title: `${destination} Local Market`, description: "Traditional market for shopping and culture", location: "Market Area", cost: "0", duration: 90, category: "attraction" }
      );
    }

    return attractions;
  }

  private getLocationRestaurants(destination: string, interests: string[]): any[] {
    const restaurants = [];
    
    if (destination.toLowerCase().includes('delhi')) {
      restaurants.push(
        { title: "Paranthe Wali Gali", description: "Famous for traditional parathas", location: "Chandni Chowk", cost: "300", duration: 60, category: "restaurant" },
        { title: "Karim's", description: "Historic Mughlai cuisine restaurant", location: "Jama Masjid", cost: "600", duration: 90, category: "restaurant" }
      );
    } else if (destination.toLowerCase().includes('mumbai')) {
      restaurants.push(
        { title: "Leopold Cafe", description: "Iconic cafe with continental and Indian food", location: "Colaba", cost: "800", duration: 90, category: "restaurant" },
        { title: "Trishna", description: "Contemporary Indian seafood", location: "Bandra", cost: "1500", duration: 120, category: "restaurant" }
      );
    } else {
      restaurants.push(
        { title: `${destination} Local Kitchen`, description: "Authentic regional cuisine", location: "City Center", cost: "500", duration: 90, category: "restaurant" },
        { title: `Traditional ${destination} Restaurant`, description: "Popular local dining spot", location: "Main Area", cost: "700", duration: 90, category: "restaurant" }
      );
    }

    return restaurants;
  }

  async getPersonalizedHotelRecommendations(preferences: {
    destination: string;
    budget: number;
    travelStyle: string;
    interests: string[];
    amenities: string[];
    travelers: number;
  }): Promise<Hotel[]> {
    try {
      console.log("🌟 Using Gemini for hotel recommendations");

      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const prompt = `Recommend 3 hotels for this traveler in JSON format:

Destination: ${preferences.destination}
Budget: ₹${preferences.budget} per night
Travel Style: ${preferences.travelStyle}
Interests: ${preferences.interests.join(", ")}
Preferred Amenities: ${preferences.amenities.join(", ")}
Travelers: ${preferences.travelers}

Return ONLY a JSON array with this structure:
[
  {
    "id": "hotel-1",
    "name": "Hotel Name",
    "location": "Area/District",
    "address": "Full address",
    "rating": "4.2",
    "pricePerNight": "3500",
    "currency": "INR",
    "amenities": ["WiFi", "Pool", "Restaurant"],
    "description": "Brief description",
    "aiInsight": "Why recommended for this traveler"
  }
]

Focus on real hotels within budget in ${preferences.destination}.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response");
      }

      const hotels = JSON.parse(jsonMatch[0]);
      return hotels.map((hotel: any) => ({
        ...hotel,
        bookingUrl: null,
        coordinates: null,
        images: null
      }));

    } catch (error) {
      console.error("❌ Gemini Hotel Error:", error);
      
      // Location-specific fallback data with variety
      console.log("⚠️ Using fallback data for:", preferences.destination);
      
      const hotelNames = this.getLocationSpecificHotels(preferences.destination, preferences.travelStyle, preferences.budget);
      
      return [
        {
          id: "fallback-1",
          name: hotelNames.luxury,
          location: `${preferences.destination} ${this.getLocationArea(preferences.destination, 'upscale')}`,
          address: `${Math.floor(Math.random() * 999) + 1} ${this.getLocationArea(preferences.destination, 'upscale')}, ${preferences.destination}`,
          rating: (4.0 + Math.random() * 0.8).toFixed(1),
          pricePerNight: preferences.budget.toString(),
          currency: "INR",
          amenities: preferences.amenities.length > 0 ? preferences.amenities : this.getLuxuryAmenities(),
          description: `An exquisite ${preferences.travelStyle} hotel in ${preferences.destination} featuring world-class hospitality and authentic local charm.`,
          aiInsight: `Perfectly suited for ${preferences.travelStyle} travelers with interests in ${preferences.interests.join(", ")}. Premium location with excellent value at ₹${preferences.budget}/night.`,
          bookingUrl: null,
          coordinates: null,
          images: null
        },
        {
          id: "fallback-2",
          name: hotelNames.boutique,
          location: `${preferences.destination} ${this.getLocationArea(preferences.destination, 'cultural')}`,
          address: `${Math.floor(Math.random() * 999) + 1} ${this.getLocationArea(preferences.destination, 'cultural')}, ${preferences.destination}`,
          rating: (4.1 + Math.random() * 0.6).toFixed(1),
          pricePerNight: Math.round(preferences.budget * 0.75).toString(),
          currency: "INR",
          amenities: ["WiFi", "Restaurant", "Concierge", "Cultural Tours", "Spa"],
          description: `A charming boutique property in ${preferences.destination} that captures the essence of local culture and modern comfort.`,
          aiInsight: `Great choice for cultural enthusiasts who appreciate authentic experiences. Located in the heart of ${preferences.destination}'s heritage district.`,
          bookingUrl: null,
          coordinates: null,
          images: null
        },
        {
          id: "fallback-3",
          name: hotelNames.modern,
          location: `${preferences.destination} ${this.getLocationArea(preferences.destination, 'business')}`,
          address: `${Math.floor(Math.random() * 999) + 1} ${this.getLocationArea(preferences.destination, 'business')}, ${preferences.destination}`,
          rating: (3.9 + Math.random() * 0.7).toFixed(1),
          pricePerNight: Math.round(preferences.budget * 0.6).toString(),
          currency: "INR",
          amenities: ["WiFi", "Gym", "Business Center", "24/7 Room Service", "Airport Transfer"],
          description: `A contemporary hotel in ${preferences.destination} offering modern amenities and excellent connectivity.`,
          aiInsight: `Perfect for travelers seeking modern convenience with great accessibility to ${preferences.destination}'s attractions and transport hubs.`,
          bookingUrl: null,
          coordinates: null,
          images: null
        }
      ];
    }
  }

  async discoverHiddenGems(destination: string, preferences: { interests: string[]; budget: number; travelStyle: string; duration: number }): Promise<Activity[]> {
    try {
      console.log("🌟 Using Gemini for hidden gems in:", destination);

      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const prompt = `Discover 3 hidden gems in ${destination} that most tourists don't know about.

Interests: ${preferences.interests.join(", ")}
Budget: ₹${preferences.budget}
Duration: ${preferences.duration} days

Return ONLY a JSON array with this structure:
[
  {
    "id": "gem-1",
    "title": "Hidden Spot Name",
    "description": "What makes it special",
    "location": "Area/Location",
    "cost": "200",
    "duration": 90,
    "category": "experience",
    "notes": "Best time to visit and insider tips"
  }
]

Focus on authentic local experiences off the beaten path.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response");
      }

      const gems = JSON.parse(jsonMatch[0]);
      return gems.map((gem: any) => ({
        ...gem,
        address: null,
        coordinates: null,
        startTime: null,
        endTime: null,
        priority: 1,
        bookingUrl: null,
        sortOrder: 0,
        dayId: ""
      }));

    } catch (error) {
      console.error("❌ Gemini Hidden Gems Error:", error);
      
      // Fallback hidden gems
      return [
        {
          id: "fallback-gem-1",
          title: `Local Market Experience in ${destination}`,
          description: `Explore the authentic local market in ${destination} where locals shop daily. A hidden gem because most tourists stick to tourist markets, but locals shop here.`,
          location: `${destination} Local Market`,
          address: null,
          coordinates: null,
          startTime: "06:00",
          endTime: "09:00",
          cost: "200",
          duration: 90,
          category: "experience",
          priority: 1,
          bookingUrl: null,
          notes: "Best time is early morning when fresh produce arrives. Great for colorful produce displays and local vendor photos.",
          sortOrder: 0,
          dayId: ""
        },
        {
          id: "fallback-gem-2",
          title: `Hidden Temple in ${destination}`,
          description: `A peaceful temple away from tourist crowds in ${destination}. Hidden gem located in residential area, not found in guidebooks.`,
          location: `${destination} Old Quarter`,
          address: null,
          coordinates: null,
          startTime: "06:00",
          endTime: "18:00",
          cost: "0",
          duration: 60,
          category: "attraction",
          priority: 1,
          bookingUrl: null,
          notes: "Visit during prayer times for the full experience. Best at sunrise or sunset. Beautiful architecture and peaceful atmosphere for photos.",
          sortOrder: 0,
          dayId: ""
        }
      ];
    }
  }

  async analyzeReviewSentiment(reviews: string[]): Promise<{
    overallSentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    keyInsights: string[];
    commonThemes: string[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const prompt = `Analyze the sentiment of these travel reviews and return JSON:

Reviews:
${reviews.map((review, i) => `${i + 1}. ${review}`).join('\n')}

Return ONLY this JSON structure:
{
  "overallSentiment": "positive|negative|neutral",
  "sentimentScore": 0.75,
  "keyInsights": ["Main insight 1", "Main insight 2"],
  "commonThemes": ["Theme 1", "Theme 2"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response");
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error("❌ Gemini Sentiment Error:", error);
      
      return {
        overallSentiment: 'positive' as const,
        sentimentScore: 0.7,
        keyInsights: ["Generally positive feedback", "Mixed experiences reported"],
        commonThemes: ["Service quality", "Location", "Value for money"]
      };
    }
  }

  async optimizeItinerary(activities: Activity[], constraints: { budget: number; time: number }): Promise<Activity[]> {
    // Simple optimization - sort by cost-effectiveness
    return activities
      .filter(activity => parseFloat(activity.cost || "0") <= constraints.budget)
      .sort((a, b) => {
        const costA = parseFloat(a.cost || "0");
        const costB = parseFloat(b.cost || "0");
        const durationA = a.duration || 60;
        const durationB = b.duration || 60;
        
        const valueA = durationA / (costA || 1);
        const valueB = durationB / (costB || 1);
        
        return valueB - valueA;
      })
      .slice(0, Math.floor(constraints.time / 60));
  }

  async getDestinationRecommendations(preferences: {
    interests: string[];
    budget: number;
    travelStyle: string;
    duration: string;
  }): Promise<string[]> {
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      const prompt = `Recommend 5 Indian destinations for this traveler in JSON format:

Interests: ${preferences.interests.join(", ")}
Budget: ₹${preferences.budget}
Travel Style: ${preferences.travelStyle}
Duration: ${preferences.duration}

Return ONLY a JSON array of destination names:
["Destination 1", "Destination 2", "Destination 3", "Destination 4", "Destination 5"]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response");
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error("❌ Gemini Destinations Error:", error);
      
      // Smart fallback based on preferences
      const destinations: string[] = [];
      
      if (preferences.interests.some(i => i.toLowerCase().includes('culture'))) {
        destinations.push("Jaipur", "Varanasi", "Hampi");
      }
      if (preferences.interests.some(i => i.toLowerCase().includes('beach'))) {
        destinations.push("Goa", "Kerala", "Andaman");
      }
      if (preferences.interests.some(i => i.toLowerCase().includes('mountain'))) {
        destinations.push("Manali", "Shimla", "Darjeeling");
      }
      
      // Fill remaining with popular destinations
      const popular = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"];
      while (destinations.length < 5) {
        const dest = popular.find(d => !destinations.includes(d));
        if (dest) destinations.push(dest);
        else break;
      }
      
      return destinations.slice(0, 5);
    }
  }

  // Helper methods for diverse fallback data
  private getLocationSpecificHotels(destination: string, travelStyle: string, budget: number) {
    const dest = destination.toLowerCase();
    const isLuxury = budget > 20000;
    
    const hotelSets = {
      delhi: {
        luxury: isLuxury ? "The Imperial New Delhi" : "Hotel Diplomat",
        boutique: "Haveli Dharampura",
        modern: "Lemon Tree Premier"
      },
      mumbai: {
        luxury: isLuxury ? "The Taj Mahal Palace" : "Hotel Marine Plaza", 
        boutique: "Abode Bombay",
        modern: "The Gordon House Hotel"
      },
      jaipur: {
        luxury: isLuxury ? "Rambagh Palace" : "Hotel Pearl Palace",
        boutique: "Alsisar Haveli",
        modern: "Four Points by Sheraton"
      },
      goa: {
        luxury: isLuxury ? "The Leela Goa" : "Resort Terra Paraiso",
        boutique: "Pousada by the Beach",
        modern: "Novotel Goa Resort"
      },
      bangalore: {
        luxury: isLuxury ? "The Leela Palace" : "Hotel Nandhana Grand",
        boutique: "The Paul Bangalore",
        modern: "Lemon Tree Premier"
      }
    };

    return hotelSets[dest as keyof typeof hotelSets] || {
      luxury: `${destination} ${isLuxury ? 'Palace Hotel' : 'Grand Hotel'}`,
      boutique: `${destination} Heritage Inn`,
      modern: `${destination} Business Hotel`
    };
  }

  private getLocationArea(destination: string, areaType: 'upscale' | 'cultural' | 'business') {
    const dest = destination.toLowerCase();
    
    const areas = {
      delhi: {
        upscale: "Connaught Place",
        cultural: "Old Delhi", 
        business: "Karol Bagh"
      },
      mumbai: {
        upscale: "South Mumbai",
        cultural: "Fort District",
        business: "Bandra-Kurla Complex"
      },
      jaipur: {
        upscale: "Civil Lines",
        cultural: "Pink City",
        business: "Malviya Nagar"
      },
      goa: {
        upscale: "Candolim Beach",
        cultural: "Old Goa",
        business: "Panaji"
      },
      bangalore: {
        upscale: "UB City Mall Area",
        cultural: "Basavanagudi",
        business: "Electronic City"
      }
    };

    return areas[dest as keyof typeof areas]?.[areaType] || `${destination} ${areaType === 'upscale' ? 'Premium' : areaType === 'cultural' ? 'Heritage' : 'Central'} District`;
  }

  private getLuxuryAmenities() {
    const amenities = [
      ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Concierge"],
      ["WiFi", "Infinity Pool", "Fine Dining", "Butler Service", "Yoga Studio"],
      ["WiFi", "Rooftop Pool", "Multi-cuisine Restaurant", "Fitness Center", "Business Lounge"],
      ["WiFi", "Swimming Pool", "Ayurvedic Spa", "Garden Restaurant", "Cultural Tours"]
    ];
    
    return amenities[Math.floor(Math.random() * amenities.length)];
  }
}

export const aiTravelPlanner = new AITravelPlanner();
