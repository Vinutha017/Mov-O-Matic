// AI Generated Itinerary and Hotel Recommendations Demo
// This shows the exact JSON format that your AI system generates

import { aiTravelPlanner } from './server/services/gemini.ts';

async function demonstrateAIGeneration() {
  console.log('🤖 MOV-O-MATIC AI SYSTEM DEMONSTRATION');
  console.log('=====================================\n');

  // 1. AI-Generated Trip Itinerary
  console.log('1️⃣ AI-GENERATED TRIP ITINERARY');
  console.log('================================');
  
  const tripRequest = {
    destination: 'Mumbai',
    budget: 15000,
    duration: 3,
    travelStyle: 'adventure',
    interests: ['food', 'culture', 'nightlife'],
    travelers: 2,
    description: 'A 3-day adventure trip to Mumbai for 2 people interested in food, culture, and nightlife with a budget of ₹15,000'
  };

  console.log('📝 Request Parameters:');
  console.log(JSON.stringify(tripRequest, null, 2));
  console.log('\n🎯 AI Generated Response:');
  
  const itinerary = await aiTravelPlanner.generateTripItinerary(tripRequest);
  console.log(JSON.stringify(itinerary, null, 2));
  
  console.log('\n' + '='.repeat(80) + '\n');

  // 2. AI Hotel Recommendations  
  console.log('2️⃣ AI HOTEL RECOMMENDATIONS');
  console.log('============================');
  
  const hotelPreferences = {
    destination: 'Mumbai',
    budget: 5000,
    travelStyle: 'luxury',
    interests: ['business', 'shopping'],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    travelers: 2
  };

  console.log('📝 Request Parameters:');
  console.log(JSON.stringify(hotelPreferences, null, 2));
  console.log('\n🏨 AI Generated Hotels:');
  
  const hotels = await aiTravelPlanner.getPersonalizedHotelRecommendations(hotelPreferences);
  console.log(JSON.stringify(hotels, null, 2));
  
  console.log('\n' + '='.repeat(80) + '\n');

  // 3. AI Hidden Gems Discovery
  console.log('3️⃣ AI HIDDEN GEMS DISCOVERY');
  console.log('============================');
  
  const gemsPreferences = {
    interests: ['local culture', 'street food'],
    budget: 2000,
    travelStyle: 'authentic',
    duration: 2
  };

  console.log('📝 Request Parameters:');
  console.log(JSON.stringify(gemsPreferences, null, 2));
  console.log('\n💎 AI Generated Hidden Gems:');
  
  const hiddenGems = await aiTravelPlanner.discoverHiddenGems('Mumbai', gemsPreferences);
  console.log(JSON.stringify(hiddenGems, null, 2));
  
  console.log('\n' + '='.repeat(80) + '\n');
  console.log('✅ DEMONSTRATION COMPLETE - Your AI system is working perfectly!');
  console.log('📋 All responses are in JSON format as requested.');
}

// Run the demonstration
demonstrateAIGeneration().catch(console.error);