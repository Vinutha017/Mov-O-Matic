import axios from 'axios';

async function testAIEndpoints() {
  const baseUrl = 'http://localhost:5000/api';
  
  console.log('🤖 Testing AI-Generated Itinerary and Hotel Recommendations\n');

  // Test 1: AI-Generated Trip Itinerary
  console.log('1️⃣ Testing AI Trip Itinerary Generation...');
  try {
    const itineraryRequest = {
      destination: 'Mumbai',
      budget: 15000,
      duration: 3,
      travelStyle: 'adventure',
      interests: ['food', 'culture', 'nightlife'],
      travelers: 2,
      description: 'A 3-day adventure trip to Mumbai for 2 people interested in food, culture, and nightlife with a budget of ₹15,000'
    };

    const itineraryResponse = await axios.post(`${baseUrl}/trips/generate`, itineraryRequest);
    console.log('✅ AI Trip Itinerary Generated Successfully!');
    console.log('📋 Generated Itinerary:');
    console.log(JSON.stringify(itineraryResponse.data, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Itinerary Generation Failed:', error.response?.data || error.message);
  }

  // Test 2: AI Hotel Recommendations
  console.log('2️⃣ Testing AI Hotel Recommendations...');
  try {
    const hotelRequest = {
      destination: 'Mumbai',
      budget: 5000,
      travelStyle: 'luxury',
      interests: ['business', 'shopping'],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
      travelers: 2
    };

    const hotelResponse = await axios.post(`${baseUrl}/ai/hotel-recommendations`, hotelRequest);
    console.log('✅ AI Hotel Recommendations Generated Successfully!');
    console.log('🏨 Recommended Hotels:');
    console.log(JSON.stringify(hotelResponse.data, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Hotel Recommendations Failed:', error.response?.data || error.message);
  }

  // Test 3: AI Hidden Gems Discovery
  console.log('3️⃣ Testing AI Hidden Gems Discovery...');
  try {
    const gemsRequest = {
      destination: 'Mumbai',
      preferences: {
        interests: ['local culture', 'street food'],
        budget: 2000,
        travelStyle: 'authentic',
        duration: 2
      }
    };

    const gemsResponse = await axios.post(`${baseUrl}/ai/hidden-gems`, gemsRequest);
    console.log('✅ AI Hidden Gems Generated Successfully!');
    console.log('💎 Hidden Gems:');
    console.log(JSON.stringify(gemsResponse.data, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Hidden Gems Failed:', error.response?.data || error.message);
  }
}

// Run the tests
testAIEndpoints().catch(console.error);