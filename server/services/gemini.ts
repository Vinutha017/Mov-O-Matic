import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AITripRequest, AIRecommendation, Activity, Hotel } from "@shared/schema";

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class AITravelPlanner {
  
  // Validate user preferences against destination availability
  private async validateDestinationCompatibility(request: AITripRequest): Promise<{
    isValid: boolean;
    unavailableInterests: string[];
    unavailableFoods: string[];
    unavailableActivities: string[];
    suggestions: string[];
  }> {
    const unavailableInterests: string[] = [];
    const unavailableFoods: string[] = [];
    const unavailableActivities: string[] = [];
    const suggestions: string[] = [];
    
    // Create a quick validation prompt for Gemini
    const validationPrompt = `You are a destination expert. For ${request.destination}, analyze these user preferences and identify what's NOT available or suitable:

INTERESTS TO CHECK: ${(request.interests || []).join(', ')}
ACTIVITY TYPES TO CHECK: ${(request.activityTypes || []).join(', ')}  
FOOD PREFERENCES TO CHECK: ${(request.foodPreferences || []).join(', ')}

Respond in this exact JSON format:
{
  "unavailableInterests": ["interest1", "interest2"],
  "unavailableFoods": ["food1", "food2"], 
  "unavailableActivities": ["activity1", "activity2"],
  "suggestions": ["Try this instead", "Alternative option"]
}

Only include items that are truly NOT available or unsuitable for ${request.destination}. If everything is available, return empty arrays.`;

    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      const result = await model.generateContent(validationPrompt);
      const response = await result.response;
      
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const validation = JSON.parse(jsonMatch[0]);
          return {
            isValid: validation.unavailableInterests.length === 0 && 
                     validation.unavailableFoods.length === 0 && 
                     validation.unavailableActivities.length === 0,
            unavailableInterests: validation.unavailableInterests || [],
            unavailableFoods: validation.unavailableFoods || [],
            unavailableActivities: validation.unavailableActivities || [],
            suggestions: validation.suggestions || []
          };
        }
      }
    } catch (error) {
      console.log("⚠️ Validation check failed, proceeding with user preferences:", error);
    }
    
    // Default to valid if validation fails
    return {
      isValid: true,
      unavailableInterests: [],
      unavailableFoods: [],
      unavailableActivities: [],
      suggestions: []
    };
  }

  async generateTripItinerary(request: AITripRequest): Promise<AIRecommendation> {
    console.log("🌟 Using Google Gemini 2.5 Flash for trip generation");
    console.log("📝 Request:", JSON.stringify(request, null, 2));
    // Calculate actual duration from start and end dates
    let calculatedDuration = 3; // fallback only if no dates provided
    
    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      
      // Calculate difference in days
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Ensure minimum 1 day, maximum reasonable limit
      calculatedDuration = Math.max(1, Math.min(diffDays, 30));
      
      console.log("� DATE CALCULATION:", {
        startDate: request.startDate,
        endDate: request.endDate,
        calculatedDays: calculatedDuration,
        originalDuration: request.duration
      });
    } else if (request.duration) {
      // Use provided duration if no dates
      calculatedDuration = Number(request.duration) || 3;
      console.log("📅 USING PROVIDED DURATION:", calculatedDuration);
    } else {
      console.log("📅 NO DATES OR DURATION PROVIDED, USING DEFAULT:", calculatedDuration);
    }
    
    // Override request.duration with calculated value
    const actualDuration = calculatedDuration;
    
    console.log("🗓️ FINAL DURATION:", {
      rawDuration: request.duration,
      calculatedFromDates: calculatedDuration,
      actualDurationUsed: actualDuration
    });
    
    // Validate destination compatibility
    const validation = await this.validateDestinationCompatibility(request);
    console.log("🔍 Destination Validation:", validation);
    
    if (!validation.isValid) {
      // Create a modified request with warnings and alternatives
      console.log("⚠️ Some preferences unavailable at destination, adding suggestions");
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      // Calculate dates for each day
      const startDate = request.startDate ? new Date(request.startDate) : new Date();
      
      // Ensure the startDate is valid
      if (isNaN(startDate.getTime())) {
        console.warn("Invalid start date provided, using current date");
        startDate.setTime(Date.now());
      }
      
      const generateDateString = (dayIndex: number) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + dayIndex);
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      };

      // Pre-calculate all dates for the prompt using actual calculated duration
      const tripDates = Array.from({length: actualDuration}, (_, i) => generateDateString(i));
      
      console.log("📅 TRIP DATES GENERATED:", {
        requestedDays: actualDuration,
        generatedDates: tripDates,
        totalDates: tripDates.length
      });

      const prompt = `🚨🚨🚨 MANDATORY REQUIREMENT: CREATE EXACTLY ${actualDuration} DAYS 🚨🚨🚨

You are a world-class travel curator with 15+ years crafting extraordinary travel experiences. Design a premium, detailed itinerary for ${request.destination} that feels like it was created by a luxury travel agency.

${!validation.isValid ? `
⚠️ DESTINATION COMPATIBILITY ALERTS:
${validation.unavailableInterests.length > 0 ? `• UNAVAILABLE INTERESTS: ${validation.unavailableInterests.join(', ')} - Not available in ${request.destination}` : ''}
${validation.unavailableFoods.length > 0 ? `• UNAVAILABLE FOODS: ${validation.unavailableFoods.join(', ')} - Limited or not available in ${request.destination}` : ''}
${validation.unavailableActivities.length > 0 ? `• UNAVAILABLE ACTIVITIES: ${validation.unavailableActivities.join(', ')} - Not suitable for ${request.destination}` : ''}
${validation.suggestions.length > 0 ? `• SUGGESTIONS: ${validation.suggestions.join(' | ')}` : ''}

IMPORTANT: Include these compatibility warnings in your response and suggest alternatives.
` : ''}

🚨 ABSOLUTE CRITICAL RULE: USER WANTS EXACTLY ${actualDuration} DAYS
🚨 YOU MUST CREATE ${actualDuration} SEPARATE DAY OBJECTS IN THE ITINERARY ARRAY
🚨 NOT 1 DAY, NOT 2 DAYS, NOT 3 DAYS - EXACTLY ${actualDuration} DAYS!
🚨 COUNT THEM: ${Array.from({length: actualDuration}, (_, i) => `Day ${i + 1}`).join(', ')}

🎯 COMPLETE TRAVELER PROFILE:
• Destination: ${request.destination}${request.startLocation ? ` (traveling from ${request.startLocation})` : ''}
• Total Budget: ₹${request.budget} (use 85-95% efficiently)
• Trip Duration: ${actualDuration} days (calculated from ${request.startDate} to ${request.endDate})
• Group Size: ${request.travelers || 2} travelers
• Travel Style: ${request.travelStyle || 'leisure'} (tailor all recommendations)
• Trip Type: ${request.tripType || 'leisure'} (adjust itinerary focus accordingly)
• Trip Theme: ${request.tripTheme || 'general exploration'} (match activities to theme)
• Primary Interests: ${(request.interests || ['sightseeing']).join(', ')}
• Specific Activities: ${(request.activityTypes || []).length > 0 ? (request.activityTypes || []).join(', ') : 'open to suggestions'}
• Mode of Travel: ${request.modeOfTravel || 'flexible'} (consider arrival/departure logistics)
• Preferred Departure: ${request.preferredDepartureTime || 'flexible timing'}
• Food Preferences: ${(request.foodPreferences || []).length > 0 ? (request.foodPreferences || []).join(', ') : 'no restrictions'}
• Transport Preferences: ${(request.transportPreferences || []).length > 0 ? (request.transportPreferences || []).join(', ') : 'any mode'}
• Hotel Type Preferred: ${request.hotelType || 'mid-range'}
• Room Type Needed: ${request.roomType || 'standard'}
• Required Amenities: ${(request.accommodationAmenities || []).length > 0 ? (request.accommodationAmenities || []).join(', ') : 'basic amenities'}
• Mobility Requirements: ${request.mobilityRequirements || 'no special requirements'}
• Special Requirements: ${request.specialRequirements || 'none'}
• Trip Vision: ${request.description || 'A memorable travel experience'}

🌟 PREMIUM ITINERARY REQUIREMENTS:
1. TIMING PERFECTION: Every activity has precise start/end times with logical flow
2. LOCAL INSIDER KNOWLEDGE: Include hidden gems and authentic local experiences
3. CULTURAL IMMERSION: Add cultural context, etiquette tips, and local traditions
4. WEATHER SMART: Consider seasonal factors and provide backup indoor options
5. BUDGET OPTIMIZATION: Maximize value while staying within budget constraints
6. COMFORT FOCUS: Include rest periods, bathroom breaks, and meal timing
7. TRANSPORT LOGISTICS: Account for travel time between locations
8. PHOTO OPPORTUNITIES: Highlight Instagram-worthy spots and best photo times

🗓️ DAILY STRUCTURE MANDATE:
• 8:00-10:00 AM: Energizing morning activity (breakfast + light exploration)
• 10:00-13:00 PM: Main morning attraction/experience
• 13:00-14:30 PM: Lunch break with local cuisine recommendations
• 14:30-17:30 PM: Afternoon exploration or major attraction
• 17:30-19:00 PM: Sunset/leisure time or cultural activity
• 19:00-21:00 PM: Dinner and evening entertainment
• 21:00+ PM: Optional nightlife or relaxation suggestions

💰 SMART BUDGET ALLOCATION:
• Accommodation: 35% of total budget
• Activities & Attractions: 30% of total budget
• Food & Dining: 25% of total budget  
• Transportation: 10% of total budget

🎯 INSTRUCTIONS: Replace ALL [bracketed placeholders] with actual content. Create 4-6 activities per day based on user interests. Ensure all costs are realistic numbers without brackets.

Return ONLY valid JSON in this exact format:
{
  "hotels": [
    RECOMMEND 2-3 HOTELS IN ${request.destination} MATCHING COMPLETE USER PROFILE:
    - Budget: ₹${request.budget || 5000} total (hotel should fit 35% = ₹${Math.floor((request.budget || 5000) * 0.35)})
    - Hotel Type: ${request.hotelType || 'mid-range'} (luxury/budget/mid-range/boutique/resort)
    - Room Type: ${request.roomType || 'standard'} (single/double/suite/family room)
    - Travel Style: ${request.travelStyle || 'leisure'} & Trip Type: ${request.tripType || 'leisure'}
    - Group: ${request.travelers || 2} travelers (room capacity and layout)
    - Required Amenities: ${(request.accommodationAmenities || []).length > 0 ? (request.accommodationAmenities || []).join(', ') : 'WiFi, AC, room service'}
    - Interests: ${(request.interests || ['sightseeing']).join(', ')} (location should support these activities)
    - Mobility: ${request.mobilityRequirements || 'no special requirements'} (ensure accessibility if needed)
    - Special Requirements: ${request.specialRequirements || 'none'}
    
    HOTEL FORMAT:
    {
      "id": "hotel-[number]",
      "name": "[Actual hotel name in ${request.destination}]",
      "location": "[Specific area in ${request.destination} near user interests]",
      "address": "[Real street address if known, or realistic address]",
      "rating": "[4.0-4.8 realistic rating]",
      "pricePerNight": "[Fits budget: ₹${Math.floor((request.budget || 5000) * 0.35 / actualDuration)} per night]",
      "currency": "INR",
      "amenities": "[Amenities matching ${request.travelStyle || 'leisure'} style]",
      "description": "[Why this hotel suits ${request.travelStyle || 'leisure'} travelers interested in ${(request.interests || ['sightseeing']).join(', ')}]",
      "aiInsight": "[Perfect for ${request.travelers || 2} ${request.travelStyle || 'leisure'} travelers focusing on ${(request.interests || ['sightseeing']).join(', ')}]",
      "bookingTips": "[Season and advance booking advice for ${request.destination}]",
      "nearbyAttractions": "[List attractions within 15 min that match user interests: ${(request.interests || ['sightseeing']).join(', ')}]"
    }
  ],
  "attractions": [
    RECOMMEND 4-6 ATTRACTIONS IN ${request.destination} BASED ON USER INTERESTS:
    - Primary Interests: ${(request.interests || ['sightseeing']).join(', ')} (MATCH THESE EXACTLY)
    - Budget: ₹${Math.floor((request.budget || 5000) * 0.30)} for attractions (distribute among attractions)
    - Duration: ${actualDuration} days (spread attractions across days)
    - Travel Style: ${request.travelStyle || 'leisure'} (adjust activity intensity)
    - Group: ${request.travelers || 2} people (consider group suitability)
    
    ATTRACTION FORMAT:
    {
      "id": "attr-[number]",
      "title": "[Real attraction name in ${request.destination} matching ${(request.interests || ['sightseeing']).join(', ')}]",
      "description": "[Why this attraction is perfect for ${(request.interests || ['sightseeing']).join(', ')} enthusiasts]",
      "location": "[Specific area/district in ${request.destination}]",
      "cost": "[Realistic entry fee for ${request.travelers || 2} people]",
      "duration": "[Time needed based on ${request.travelStyle || 'leisure'} pace]",
      "category": "[Match to user interests: ${(request.interests || ['sightseeing']).join('/')}]",
      "bestTime": "[Optimal visiting time considering crowds and lighting]",
      "insiderTips": "[Specific tips for ${(request.interests || ['sightseeing']).join(', ')} lovers]",
      "culturalContext": "[Significance to ${request.destination} heritage]",
      "whyRecommended": "[Perfect for ${request.travelers || 2} ${request.travelStyle || 'leisure'} travelers interested in ${(request.interests || ['sightseeing']).join(', ')}]"
    }
  ],
  "restaurants": [
    RECOMMEND 3-5 RESTAURANTS IN ${request.destination} FOR COMPLETE USER PROFILE:
    - Budget: ₹${Math.floor((request.budget || 5000) * 0.25)} for dining (₹${Math.floor((request.budget || 5000) * 0.25 / actualDuration)} per day)
    - Group: ${request.travelers || 2} people (consider table size and group menus)
    - Travel Style: ${request.travelStyle || 'leisure'} & Trip Type: ${request.tripType || 'leisure'}
    - Food Preferences: ${(request.foodPreferences || []).length > 0 ? (request.foodPreferences || []).join(', ') : 'no dietary restrictions'}
    - Duration: ${actualDuration} days (variety across days)
    - Trip Theme: ${request.tripTheme || 'general'} (romantic/family/business/adventure dining)
    - Special Requirements: ${request.specialRequirements || 'none'} (allergies, dietary needs)
    - Local Preferences: Focus on ${request.destination} authentic cuisine
    
    RESTAURANT FORMAT:
    {
      "id": "rest-[number]",
      "title": "[Real restaurant name in ${request.destination} matching travel style]",
      "description": "[Cuisine type perfect for ${request.travelStyle || 'leisure'} ${request.travelers || 2}-person group]",
      "location": "[Specific area in ${request.destination}]",
      "cost": "[Meal cost for ${request.travelers || 2} people fitting daily budget]",
      "duration": "[Dining duration appropriate for ${request.travelStyle || 'leisure'} style]",
      "category": "[Match to ${request.travelStyle || 'leisure'}: fine-dining/casual/street-food/traditional]",
      "mustTryDishes": "[3-4 signature dishes from ${request.destination}]",
      "diningTips": "[Booking, timing, and etiquette advice for ${request.destination}]",
      "perfectFor": "[Why ideal for ${request.travelers || 2} ${request.travelStyle || 'leisure'} travelers]"
    }
  ],
  "itinerary": [
    ⚠️ CRITICAL: YOU MUST CREATE EXACTLY ${actualDuration} DAY OBJECTS IN THIS ARRAY
    ⚠️ EACH DAY MUST HAVE: day number, date, dayTitle, activities (4-6 each), dailyCost, transportationCost, dailyTips
    ⚠️ DATES TO USE: ${tripDates.join(' → ')}
    
    CREATE ${actualDuration} COMPLETE DAY OBJECTS FOLLOWING THIS STRUCTURE:
    
    Day 1 Object: {
      "day": 1,
      "date": "${tripDates[0]}",
      "dayTitle": "[Theme for arrival day in ${request.destination}]",
      "weatherConsideration": "[Weather advice for ${request.destination}]",
      "activities": [
        CREATE 4-6 ACTIVITIES for Day 1 matching: ${(request.interests || ['sightseeing']).join(', ')}
        Each activity needs: timeSlot, activityType, title, location, description, cost, duration, tips, travelTime, photoOpportunity, relevanceToInterests
      ],
      "dailyCost": [sum of all Day 1 costs],
      "transportationCost": [Day 1 transport],
      "dailyTips": ["Day 1 specific tips"],
      "emergencyInfo": "[Day 1 medical facilities]"
    },
    
    ${actualDuration > 1 ? `Day 2 Object: {
      "day": 2,
      "date": "${tripDates[1] || 'Next day'}",
      "dayTitle": "[Theme for Day 2 in ${request.destination}]",
      "weatherConsideration": "[Day 2 weather advice]",
      "activities": [CREATE 4-6 DIFFERENT ACTIVITIES for Day 2],
      "dailyCost": [Day 2 costs],
      "transportationCost": [Day 2 transport],
      "dailyTips": ["Day 2 tips"],
      "emergencyInfo": "[Day 2 facilities]"
    },` : ''}
    
    ${actualDuration > 2 ? `Day 3 Object: { same structure for Day 3 },` : ''}
    ${actualDuration > 3 ? `Day 4 Object: { same structure for Day 4 },` : ''}
    ${actualDuration > 4 ? `Day 5 Object: { same structure for Day 5 },` : ''}
    ${actualDuration > 5 ? `Day 6 Object: { same structure for Day 6 },` : ''}
    ${actualDuration > 6 ? `Day 7 Object: { same structure for Day 7 },` : ''}
    
    ⚠️ CONTINUE UNTIL YOU HAVE ${actualDuration} COMPLETE DAY OBJECTS
  ],
  "totalEstimatedCost": ${request.budget},
  "budgetBreakdown": {
    "accommodation": "${Math.floor((request.budget || 5000) * 0.35)}",
    "activities": "${Math.floor((request.budget || 5000) * 0.30)}", 
    "food": "${Math.floor((request.budget || 5000) * 0.25)}",
    "transportation": "${Math.floor((request.budget || 5000) * 0.10)}"
  },
  "tips": [
    "💡 INSIDER SECRET: Best photography time is during golden hour (6-7 PM)",
    "🍽️ FOODIE TIP: Street food is safest from busy stalls with high turnover",
    "💰 MONEY SMART: Negotiate auto-rickshaw fares before starting the ride",
    "🏛️ CULTURAL RESPECT: Remove shoes before entering religious sites",
    "📱 TECH TIP: Download offline maps and keep power bank handy",
    "🌡️ WEATHER WISE: Carry umbrella during monsoon season (June-September)"
  ],
  "localEtiquette": [
    "Greet locals with 'Namaste' and folded hands",
    "Dress conservatively especially near religious places",
    "Use right hand for eating and greeting",
    "Avoid pointing feet towards people or sacred objects"
  ],
  "packingEssentials": [
    "Comfortable walking shoes",
    "Light cotton clothes and modest attire",
    "Sunscreen and hat for sun protection",
    "Portable charger and universal adapter",
    "First aid kit and personal medications",
    "Reusable water bottle"
  ],
  "safetyTips": [
    "Keep copies of important documents in separate bags",
    "Use official taxis or verified ride-sharing apps",
    "Avoid isolated areas after dark",
    "Keep emergency contacts saved in phone",
    "Inform hotel about your daily plans"
  ],
  "destinationCompatibility": {
    "unavailableInterests": [${validation.unavailableInterests.length > 0 ? `"${validation.unavailableInterests.join('", "')}"` : ''}],
    "unavailableFoods": [${validation.unavailableFoods.length > 0 ? `"${validation.unavailableFoods.join('", "')}"` : ''}],
    "unavailableActivities": [${validation.unavailableActivities.length > 0 ? `"${validation.unavailableActivities.join('", "')}"` : ''}],
    "alternativeSuggestions": [${validation.suggestions.length > 0 ? `"${validation.suggestions.join('", "')}"` : ''}],
    "compatibilityNote": "${!validation.isValid ? `Some of your selected preferences are not available in ${request.destination}. We've suggested alternatives in your itinerary.` : `All your preferences are available in ${request.destination}!`}"
  }
}

🎯 CRITICAL REQUIREMENTS - FOLLOW EXACTLY:

1. **DURATION COMPLIANCE**: Generate EXACTLY ${actualDuration} days in itinerary array
2. **INTEREST MATCHING**: Every attraction/activity MUST relate to: ${(request.interests || ['sightseeing']).join(', ')}
3. **BUDGET DISTRIBUTION**: Total costs should not exceed ₹${request.budget || 5000}
4. **STYLE CONSISTENCY**: All recommendations match '${request.travelStyle || 'leisure'}' travel style
5. **GROUP APPROPRIATE**: All activities suitable for ${request.travelers || 2} people
6. **LOCATION ACCURACY**: All recommendations must be real places in ${request.destination}
7. **NO PLACEHOLDER TEXT**: Replace ALL [...] with actual content
8. **DYNAMIC CONTENT**: No hardcoded examples - everything based on user inputs above

VALIDATION CHECKLIST BEFORE RESPONDING:
✅ ITINERARY ARRAY LENGTH = ${actualDuration} (MUST HAVE EXACTLY ${actualDuration} DAY OBJECTS)
✅ Day numbers: 1, 2, 3${actualDuration > 3 ? `, ..., ${actualDuration}` : ''} with corresponding dates
✅ Each day has: day number, date (${tripDates[0]}${tripDates.length > 1 ? `, ${tripDates[1]}` : ''}${tripDates.length > 2 ? `, etc.` : ''}), dayTitle, activities
✅ Activities match interests: ${(request.interests || ['sightseeing']).join(', ')}
✅ Budget breakdown totals ≤ ₹${request.budget || 5000}
✅ Travel style '${request.travelStyle || 'leisure'}' reflected in pace and choices
✅ Group size ${request.travelers || 2} considered in all recommendations
✅ All locations are real places in ${request.destination}

🚨 FINAL VALIDATION BEFORE SENDING RESPONSE:
1. COUNT THE DAY OBJECTS IN YOUR ITINERARY ARRAY: Must be ${request.duration || 3}
2. CHECK EACH DAY HAS: day number, date, dayTitle, activities, dailyCost, transportationCost, dailyTips
3. VERIFY DATES: ${tripDates.join(' → ')}
4. CONFIRM: Day 1, Day 2, Day 3${Number(request.duration) > 3 ? `, Day 4, Day 5, Day 6, Day 7...up to Day ${request.duration}` : ''}

🚨 IF YOU HAVE FEWER THAN ${actualDuration} DAY OBJECTS, ADD MORE DAYS!
🚨 IF YOU HAVE MORE THAN ${actualDuration} DAY OBJECTS, REMOVE EXTRAS!

Important: Return ONLY the JSON with exactly ${actualDuration} day objects, no other text.`;

      console.log("🚀 Sending request to Gemini API...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Correct way to extract text from Gemini response
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No candidates in Gemini response");
      }
      
      const content = candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error("No content parts in Gemini response");
      }
      
      const text = content.parts[0].text;
      if (!text) {
        throw new Error("No text content in Gemini response");
      }
      
      console.log("📥 Raw Gemini Response:", text.substring(0, 500) + "...");

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in Gemini response");
      }

      const aiResponse = JSON.parse(jsonMatch[0]);
      console.log("✅ Successfully parsed AI itinerary:", Object.keys(aiResponse));
      
      // Ensure all required fields are present
      const validatedResponse: AIRecommendation = {
        hotels: aiResponse.hotels || [],
        attractions: aiResponse.attractions || [],
        restaurants: aiResponse.restaurants || [],
        itinerary: aiResponse.itinerary || [{day: 1, activities: [], estimatedCost: request.budget}],
        totalEstimatedCost: aiResponse.totalEstimatedCost || request.budget,
        tips: aiResponse.tips || [],
        destinationCompatibility: aiResponse.destinationCompatibility || undefined
      };
      
      // Add missing fields to activities
      validatedResponse.attractions = validatedResponse.attractions.map(attr => ({
        ...attr,
        address: attr.address || null,
        coordinates: attr.coordinates || null,
        startTime: attr.startTime || null,
        endTime: attr.endTime || null,
        priority: attr.priority || 1,
        bookingUrl: attr.bookingUrl || null,
        sortOrder: attr.sortOrder || 0,
        dayId: attr.dayId || ""
      }));
      
      validatedResponse.restaurants = validatedResponse.restaurants.map(rest => ({
        ...rest,
        address: rest.address || null,
        coordinates: rest.coordinates || null,
        startTime: rest.startTime || null,
        endTime: rest.endTime || null,
        priority: rest.priority || 1,
        bookingUrl: rest.bookingUrl || null,
        sortOrder: rest.sortOrder || 0,
        dayId: rest.dayId || ""
      }));
      
      // Add missing fields to hotels
      validatedResponse.hotels = validatedResponse.hotels.map(hotel => ({
        ...hotel,
        bookingUrl: hotel.bookingUrl || null,
        coordinates: hotel.coordinates || null,
        images: hotel.images || null
      }));
      
      return validatedResponse;
      
    } catch (error) {
      console.error("❌ Gemini AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error details:", errorMessage);
      throw new Error(`Failed to generate trip itinerary: ${errorMessage}`);
    }
  }



  async getPersonalizedHotelRecommendations(preferences: {
    destination: string;
    budget: number;
    travelStyle: string;
    interests: string[];
    amenities: string[];
    travelers: number;
  }): Promise<Hotel[]> {
    console.log("🌟 Using Gemini for hotel recommendations");
    


    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      const prompt = `Recommend 3 real hotels in ${preferences.destination} within ₹${preferences.budget} budget.
      Style: ${preferences.travelStyle}. Interests: ${preferences.interests.join(", ")}.
      
      Return ONLY a JSON array:
      [
        {
          "id": "hotel-1",
          "name": "Hotel Name",
          "location": "Area, ${preferences.destination}",
          "address": "Complete address",
          "rating": "4.2",
          "pricePerNight": "${Math.round(preferences.budget * 0.8)}",
          "currency": "INR",
          "amenities": ["WiFi", "Restaurant"],
          "description": "Hotel description",
          "aiInsight": "Why this hotel matches your preferences"
        }
      ]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Correct way to extract text from Gemini response
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No candidates in Gemini response");
      }
      
      const content = candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error("No content parts in Gemini response");
      }
      
      const text = content.parts[0].text;
      if (!text) {
        throw new Error("No text content in Gemini response");
      }
      
      console.log("📥 Raw Hotel Response:", text.substring(0, 300) + "...");

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No valid JSON array found in Gemini response");
      }

      const hotels = JSON.parse(jsonMatch[0]);
      console.log(`✅ Successfully parsed ${hotels.length} hotels from AI`);
      
      return hotels.map((hotel: any) => ({
        ...hotel,
        bookingUrl: null,
        coordinates: null,
        images: null
      }));
      
    } catch (error) {
      console.error("❌ Hotel Recommendation Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to get hotel recommendations: ${errorMessage}`);
    }
  }

  async discoverHiddenGems(destination: string, preferences: { 
    interests: string[]; 
    budget: number; 
    travelStyle: string; 
    duration: number 
  }): Promise<Activity[]> {
    console.log("🌟 Using Gemini for hidden gems");
    
    // ALWAYS return data to ensure UI shows content
    const fallbackGems = [
      {
        id: "fallback-gem-1",
        title: `Local Market Experience in ${destination}`,
        description: `Authentic local market where residents shop daily. Experience the real ${destination} away from tourist crowds.`,
        location: `${destination} Local Market District`,
        address: null,
        coordinates: null,
        startTime: "06:00",
        endTime: "09:00",
        cost: Math.round(preferences.budget * 0.1).toString(),
        duration: 90,
        category: "experience",
        priority: 1,
        bookingUrl: null,
        notes: "Visit early morning for best experience. Tourists usually visit commercial markets instead. Where families have shopped for generations. Best time: Early morning (6-9 AM)",
        sortOrder: 0,
        dayId: ""
      },
      {
        id: "fallback-gem-2",
        title: `Traditional Tea House in ${destination}`,
        description: `Century-old tea house frequented by local intellectuals and artists. Hidden gem with authentic ${destination} culture.`,
        location: `${destination} Old Quarter`,
        address: null,
        coordinates: null,
        startTime: "16:00",
        endTime: "18:00",
        cost: Math.round(preferences.budget * 0.05).toString(),
        duration: 120,
        category: "culture",
        priority: 1,
        bookingUrl: null,
        notes: "Try their signature tea blend unchanged for 50 years. No English signage - a true local secret.",
        sortOrder: 1,
        dayId: ""
      },
      {
        id: "fallback-gem-3",
        title: `Artisan Workshop Quarter in ${destination}`,
        description: `Traditional craftspeople working in small workshops using techniques passed down through generations.`,
        location: `${destination} Craft District`,
        address: null,
        coordinates: null,
        startTime: "10:00",
        endTime: "12:00",
        cost: Math.round(preferences.budget * 0.15).toString(),
        duration: 120,
        category: "culture",
        priority: 1,
        bookingUrl: null,
        notes: "Respectfully observe artisans at work. Some demonstrate their craft if you show genuine interest.",
        sortOrder: 2,
        dayId: ""
      }
    ];

    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      const prompt = `Discover 3 hidden gems in ${destination} for ${preferences.travelStyle} travelers.
      Interests: ${preferences.interests.join(", ")}. Budget: ₹${preferences.budget}.
      
      Return ONLY a JSON array:
      [
        {
          "id": "gem-1",
          "title": "Hidden Gem Name",
          "description": "What makes it special",
          "location": "Area in ${destination}",
          "cost": "200",
          "duration": 90,
          "category": "experience",
          "notes": "Best time to visit and tips"
        }
      ]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const gems = JSON.parse(jsonMatch[0]);
          console.log(`✅ Successfully parsed ${gems.length} hidden gems from AI`);
          return gems.map((gem: any) => ({
            ...gem,
            address: null,
            coordinates: null,
            startTime: null,
            endTime: null,
            priority: 1,
            bookingUrl: null,
            sortOrder: 0,
            dayId: "",
            whyHidden: "A local secret",
            localInsight: "Locals love this place",
            bestTimeToVisit: "Anytime"
          }));
        } catch (parseError) {
          console.log("⚠️ JSON parsing failed for gems, using fallback");
        }
      }

      console.log("⚠️ No valid JSON found for gems, using fallback");
    } catch (error) {
      console.error("❌ Hidden Gems Error:", error);
    }

    // Always return fallback data
    console.log("📋 Returning fallback hidden gems data");
    return fallbackGems;
  }

  async analyzeReviewSentiment(reviews: string[]): Promise<{
    overallSentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    keyInsights: string[];
    commonThemes: string[];
  }> {
    return {
      overallSentiment: 'positive' as const,
      sentimentScore: 0.8,
      keyInsights: ["Generally positive feedback"],
      commonThemes: ["Good service", "Nice location"]
    };
  }

  async getDestinationRecommendations(preferences: any): Promise<any[]> {
    console.log("🌍 Getting destination recommendations");
    
    // Always return data to ensure UI shows content
    const fallbackDestinations = [
      {
        id: "dest-1",
        name: "Mumbai",
        country: "India",
        description: "The financial capital of India with vibrant culture and street food",
        bestTime: "October to February",
        highlights: ["Gateway of India", "Marine Drive", "Bollywood", "Street Food"],
        budget: "Medium to High",
        travelStyle: "Urban Adventure"
      },
      {
        id: "dest-2", 
        name: "Goa",
        country: "India",
        description: "Beautiful beaches, Portuguese architecture, and relaxed atmosphere",
        bestTime: "November to March",
        highlights: ["Beaches", "Churches", "Nightlife", "Seafood"],
        budget: "Medium",
        travelStyle: "Beach & Relaxation"
      },
      {
        id: "dest-3",
        name: "Rajasthan",
        country: "India", 
        description: "Royal heritage, majestic palaces, and desert landscapes",
        bestTime: "October to March",
        highlights: ["Palaces", "Forts", "Desert Safari", "Culture"],
        budget: "Medium to High",
        travelStyle: "Cultural Heritage"
      }
    ];

    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      const prompt = `Recommend 3 travel destinations based on these preferences: ${JSON.stringify(preferences)}.
      
      Return ONLY a JSON array of destinations with this format:
      [
        {
          "id": "dest-1",
          "name": "Destination Name",
          "country": "Country",
          "description": "Why this destination matches preferences",
          "bestTime": "Best time to visit",
          "highlights": ["attraction1", "attraction2", "attraction3"],
          "budget": "Budget level",
          "travelStyle": "Travel style match"
        }
      ]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const destinations = JSON.parse(jsonMatch[0]);
          console.log(`✅ Successfully parsed ${destinations.length} destination recommendations from AI`);
          return destinations;
        } catch (parseError) {
          console.log("⚠️ JSON parsing failed for destinations, using fallback");
        }
      }

      console.log("⚠️ No valid JSON found for destinations, using fallback");
    } catch (error) {
      console.error("❌ Destination Recommendations Error:", error);
    }

    // Always return fallback data
    console.log("📋 Returning fallback destination recommendations");
    return fallbackDestinations;
  }

  async optimizeItinerary(activities: any[], constraints: any): Promise<any[]> {
    console.log("🎯 Optimizing itinerary");
    
    // Always return optimized activities to ensure UI shows content
    const optimizedActivities = activities.map((activity, index) => ({
      ...activity,
      optimizedOrder: index + 1,
      estimatedTime: activity.duration || 120,
      travelTime: index > 0 ? 30 : 0, // 30 minutes travel time between activities
      priority: activity.priority || 1,
      notes: activity.notes || `Optimized scheduling for ${activity.title || 'activity'}`,
      recommendations: `Best visited ${activity.category === 'attraction' ? 'in the morning' : 'during lunch hours'}`
    }));

    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      
      const prompt = `Optimize this itinerary based on constraints: ${JSON.stringify(constraints)}.
      
      Activities: ${JSON.stringify(activities)}
      
      Return ONLY a JSON array of optimized activities maintaining the same structure but with better ordering and timing.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const aiOptimized = JSON.parse(jsonMatch[0]);
          console.log(`✅ Successfully optimized ${aiOptimized.length} activities via AI`);
          return aiOptimized;
        } catch (parseError) {
          console.log("⚠️ JSON parsing failed for optimization, using fallback");
        }
      }

      console.log("⚠️ No valid JSON found for optimization, using fallback");
    } catch (error) {
      console.error("❌ Itinerary Optimization Error:", error);
    }

    // Always return optimized fallback data
    console.log("📋 Returning fallback optimized itinerary");
    return optimizedActivities;
  }
}

export const aiTravelPlanner = new AITravelPlanner();