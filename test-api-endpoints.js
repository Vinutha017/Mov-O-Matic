// Test API endpoints directly
import fetch from 'node-fetch';

async function testHotelAPI() {
  try {
    console.log("🏨 Testing Hotel Recommendations API...");
    
    const response = await fetch('http://localhost:5000/api/ai/hotel-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: "Mumbai",
        budget: 5000,
        travelStyle: "business",
        interests: ["food", "culture"],
        amenities: ["WiFi", "Restaurant"],
        travelers: 2
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ API Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ API Test Error:", error);
    return null;
  }
}

async function testHiddenGemsAPI() {
  try {
    console.log("\n💎 Testing Hidden Gems API...");
    
    const response = await fetch('http://localhost:5000/api/ai/hidden-gems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: "Mumbai",
        interests: ["food", "culture"],
        budget: 5000,
        travelStyle: "business",
        duration: 3
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ API Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ API Test Error:", error);
    return null;
  }
}

async function runAPITests() {
  console.log("🚀 Testing API Endpoints...\n");
  
  await testHotelAPI();
  await testHiddenGemsAPI();
  
  console.log("\n🎉 API Tests completed!");
}

runAPITests().catch(console.error);