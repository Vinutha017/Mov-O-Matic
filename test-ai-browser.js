// Simple test to verify AI endpoints work via browser
const testData = {
  destination: "Mumbai",
  budget: 5000,
  travelStyle: "business",
  interests: ["food", "culture"],
  amenities: ["WiFi", "Restaurant"],
  travelers: 2
};

console.log("🧪 Testing AI Functionality via Browser API...");
console.log("📊 Test Data:", testData);

// Test hotel recommendations
async function testHotels() {
  try {
    const response = await fetch('/api/ai/hotel-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ Hotels API Success:", result);
    return result;
  } catch (error) {
    console.error("❌ Hotels API Error:", error);
    return null;
  }
}

// Test hidden gems
async function testGems() {
  try {
    const response = await fetch('/api/ai/hidden-gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: testData.destination,
        interests: testData.interests,
        budget: testData.budget,
        travelStyle: testData.travelStyle,
        duration: 3
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ Hidden Gems API Success:", result);
    return result;
  } catch (error) {
    console.error("❌ Hidden Gems API Error:", error);
    return null;
  }
}

// Run tests when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    console.log("🚀 Running AI API Tests...");
    
    const hotels = await testHotels();
    const gems = await testGems();
    
    if (hotels && gems) {
      console.log("🎉 All AI APIs are working correctly!");
      
      // Display success message on page
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #4ade80; color: white; padding: 15px; border-radius: 8px; z-index: 9999; font-family: Arial;">
          ✅ AI APIs Working!<br>
          Hotels: ${hotels.hotels?.length || 0} found<br>
          Gems: ${gems.hiddenGems?.length || 0} found
        </div>
      `;
      document.body.appendChild(successDiv);
      
      setTimeout(() => successDiv.remove(), 5000);
    } else {
      console.log("⚠️ Some AI APIs may need attention");
    }
  });
}