// Test the fixed itinerary generation API
const testData = {
  destination: "Mumbai",
  budget: 15000,
  duration: 3,
  travelers: 2,
  interests: ["culture", "food", "history"],
  travelStyle: "leisure",
  description: "A cultural and culinary exploration of Mumbai's heritage and modern attractions"
};

console.log("🚀 Testing Itinerary Generation API...");
console.log("📝 Request Data:", JSON.stringify(testData, null, 2));

fetch('http://localhost:3001/api/trips/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(async (response) => {
  console.log('📊 Status:', response.status);
  console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error Response:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response.json();
})
.then(data => {
  console.log('✅ Success! Generated Itinerary:');
  console.log('🏨 Hotels:', data.hotels?.length || 0);
  console.log('🎯 Attractions:', data.attractions?.length || 0);
  console.log('🍽️ Restaurants:', data.restaurants?.length || 0);
  console.log('📅 Itinerary Days:', data.itinerary?.length || 0);
  console.log('💰 Total Cost:', data.totalEstimatedCost);
  console.log('💡 Tips:', data.tips?.length || 0);
  
  if (data.hotels && data.hotels.length > 0) {
    console.log('\n🏨 First Hotel:', JSON.stringify(data.hotels[0], null, 2));
  }
})
.catch(error => {
  console.error('💥 Test Failed:', error.message);
});