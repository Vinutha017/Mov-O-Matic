// Test script to verify Gemini AI API functionality
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testGeminiConnection() {
  try {
    console.log("🧪 Testing Gemini API connection...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
    
    console.log(`✅ API Key loaded (length: ${apiKey.length})`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    
    const prompt = "Generate a simple JSON response with one hotel recommendation for Mumbai: {\"name\": \"Hotel Name\", \"location\": \"Area\", \"price\": \"3000\"}";
    
    console.log("📤 Sending test prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("📥 Gemini Response:", text);
    console.log("✅ Gemini API connection successful!");
    
    return true;
  } catch (error) {
    console.error("❌ Gemini API test failed:", error);
    return false;
  }
}

// Test hotel recommendations
async function testHotelRecommendations() {
  try {
    console.log("\n🏨 Testing hotel recommendations...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    
    const prompt = `Recommend 2 hotels for this traveler in JSON format:

Destination: Mumbai
Budget: ₹5000 per night
Travel Style: business
Interests: food, culture
Preferred Amenities: WiFi, Restaurant
Travelers: 2

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

Focus on real hotels within budget in Mumbai.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("📥 Raw Hotel Response:", text);
    
    // Try to parse JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const hotels = JSON.parse(jsonMatch[0]);
      console.log("✅ Parsed Hotels:", JSON.stringify(hotels, null, 2));
      return hotels;
    } else {
      console.log("⚠️ No JSON found in response");
      return null;
    }
  } catch (error) {
    console.error("❌ Hotel recommendations test failed:", error);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting Gemini AI Tests...\n");
  
  const connectionTest = await testGeminiConnection();
  if (!connectionTest) {
    console.log("❌ Connection test failed, skipping other tests");
    return;
  }
  
  await testHotelRecommendations();
  
  console.log("\n🎉 Test suite completed!");
}

runTests().catch(console.error);