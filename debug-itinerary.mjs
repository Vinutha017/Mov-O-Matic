// Debug the actual API response structure
const testData = {
  destination: "Mumbai",
  budget: 15000,
  duration: 3,
  travelers: 2,
  interests: ["culture", "food", "history"],
  travelStyle: "leisure",
  description: "A cultural and culinary exploration"
};

console.log("🔍 Testing API Response Structure...");

fetch('http://localhost:5000/api/trips/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
  console.log("🏨 Hotels count:", data.hotels?.length);
  console.log("🎯 Attractions count:", data.attractions?.length);
  console.log("📅 Itinerary days:", data.itinerary?.length);
  
  if (data.itinerary) {
    data.itinerary.forEach((day, i) => {
      console.log(`\n📅 Day ${day.day}:`);
      console.log("  Activities count:", day.activities?.length || 0);
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((activity, j) => {
          console.log(`  Activity ${j+1}:`, typeof activity === 'string' ? activity : activity.title || 'No title');
        });
      } else {
        console.log("  ⚠️ No activities found!");
      }
    });
  }
})
.catch(err => console.error("❌ Error:", err));