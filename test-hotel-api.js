// Quick test for hotel recommendations API
const testHotelAPI = async () => {
  const testData = {
    destination: "Mumbai",
    budget: 5000,
    travelStyle: "business",
    interests: ["food", "culture"],
    amenities: ["WiFi", "Restaurant"],
    travelers: 2
  };

  console.log("🧪 Testing Hotel Recommendations API...");
  console.log("📊 Test Data:", testData);

  try {
    const response = await fetch('http://localhost:5000/api/ai/hotel-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Success! Hotels received:", result);
    console.log(`📊 Number of hotels: ${result.hotels?.length || 0}`);
    
    if (result.hotels && result.hotels.length > 0) {
      console.log("🏨 First hotel:", result.hotels[0]);
    }
    
    return result;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  }
};

testHotelAPI();