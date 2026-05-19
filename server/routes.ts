import type { Express } from "express";
import { readFile } from "fs/promises";
import path from "path";
import { storage } from "./storage";
import { aiTravelPlanner } from "./services/gemini";
import { getPersonalizedRecommendations } from "./services/recommendation-engine";
import { registerBookingRoutes } from "./modules/bookings/booking.routes";
import { insertTripSchema, insertItineraryDaySchema, insertActivitySchema, insertExpenseSchema, type AITripRequest, type AITripAssistantRequest } from "@shared/schema";
import { z } from "zod";
import { weatherService } from "./services/weather";

type CityEntry = { name: string; state: string };

async function loadFallbackCities(): Promise<CityEntry[]> {
  try {
    const fileCandidates = [
      path.join(process.cwd(), "dist", "public", "indianCities.json"),
      path.join(process.cwd(), "public", "indianCities.json"),
    ];

    let raw: string | undefined;

    for (const filePath of fileCandidates) {
      try {
        raw = await readFile(filePath, "utf-8");
        break;
      } catch {
        continue;
      }
    }

    if (!raw) {
      throw new Error("indianCities.json was not found in dist/public or public");
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Unable to load fallback cities:", error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<void> {
  await registerBookingRoutes(app);

  // Trip creation and AI planning
  app.post("/api/trips/generate", async (req, res) => {
    try {
      const request: AITripRequest = req.body;
      
      if (!request.description) {
        return res.status(400).json({ message: "Trip description is required" });
      }

      const aiRecommendation = await aiTravelPlanner.generateTripItinerary(request);
      
      res.json(aiRecommendation);
    } catch (error) {
      console.error("Trip generation error:", error);
      res.status(500).json({ message: "Failed to generate trip itinerary" });
    }
  });

  // Create trip from AI recommendation
  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);
      res.json(trip);
    } catch (error) {
      console.error("Create trip error:", error);
      res.status(400).json({ message: "Invalid trip data" });
    }
  });

  // Get trip with full details
  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTripWithDetails(req.params.id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Get trip error:", error);
      res.status(500).json({ message: "Failed to retrieve trip" });
    }
  });

  app.get("/api/recommendations/:tripId", async (req, res) => {
    try {
      const recommendations = await getPersonalizedRecommendations(req.params.tripId);
      res.json(recommendations);
    } catch (error) {
      console.error("Recommendation engine error:", error);
      res.status(404).json({ message: "Trip recommendations not available" });
    }
  });

  // Update trip
  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.updateTrip(req.params.id, req.body);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Update trip error:", error);
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  // Get user trips (for guest mode, we'll use session or cookies)
  app.get("/api/trips", async (req, res) => {
    try {
      // For MVP, return empty array since we don't have user authentication
      res.json([]);
    } catch (error) {
      console.error("Get trips error:", error);
      res.status(500).json({ message: "Failed to retrieve trips" });
    }
  });

  // Itinerary day management
  app.post("/api/trips/:tripId/days", async (req, res) => {
    try {
      const dayData = insertItineraryDaySchema.parse({
        ...req.body,
        tripId: req.params.tripId
      });
      const day = await storage.createItineraryDay(dayData);
      res.json(day);
    } catch (error) {
      console.error("Create day error:", error);
      res.status(400).json({ message: "Invalid day data" });
    }
  });

  // Activity management
  app.post("/api/days/:dayId/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse({
        ...req.body,
        dayId: req.params.dayId
      });
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Create activity error:", error);
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const activity = await storage.updateActivity(req.params.id, req.body);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      console.error("Update activity error:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteActivity(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      console.error("Delete activity error:", error);
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Expense tracking
  app.post("/api/trips/:tripId/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        tripId: req.params.tripId
      });
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Create expense error:", error);
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.get("/api/trips/:tripId/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByTripId(req.params.tripId);
      res.json(expenses);
    } catch (error) {
      console.error("Get expenses error:", error);
      res.status(500).json({ message: "Failed to retrieve expenses" });
    }
  });

  // Hotels and destinations
  app.get("/api/hotels", async (req, res) => {
    try {
      const location = req.query.location as string;
      const hotels = location 
        ? await storage.getHotelsByLocation(location)
        : await storage.getHotels();
      res.json(hotels);
    } catch (error) {
      console.error("Get hotels error:", error);
      res.status(500).json({ message: "Failed to retrieve hotels" });
    }
  });

  app.get("/api/destinations", async (req, res) => {
    try {
      const popular = req.query.popular === "true";
      const destinations = popular 
        ? await storage.getPopularDestinations(4)
        : await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Get destinations error:", error);
      res.status(500).json({ message: "Failed to retrieve destinations" });
    }
  });

  // AI recommendations
  app.post("/api/ai/destinations", async (req, res) => {
    try {
      const destinations = await aiTravelPlanner.getDestinationRecommendations(req.body);
      res.json({ destinations });
    } catch (error) {
      console.error("AI destination recommendations error:", error);
      res.status(500).json({ message: "Failed to get destination recommendations" });
    }
  });

  app.post("/api/ai/optimize-itinerary", async (req, res) => {
    try {
      const { activities, constraints } = req.body;
      const optimizedActivities = await aiTravelPlanner.optimizeItinerary(activities, constraints);
      res.json({ activities: optimizedActivities });
    } catch (error) {
      console.error("AI itinerary optimization error:", error);
      res.status(500).json({ message: "Failed to optimize itinerary" });
    }
  });

  app.post("/api/ai/trip-assistant", async (req, res) => {
    try {
      const body: AITripAssistantRequest = req.body;

      if (!body.message || !body.message.trim()) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await aiTravelPlanner.answerTripAssistant(body);
      res.json(response);
    } catch (error) {
      console.error("AI trip assistant error:", error);
      res.status(500).json({ message: "Failed to answer trip assistant query" });
    }
  });

  // New AI recommendation routes
  app.post("/api/ai/hotel-recommendations", async (req, res) => {
    try {
      console.log("Received hotel request body:", req.body);
      console.log("Hotel request headers:", req.headers);
      console.log("Hotel Content-Type:", req.headers['content-type']);
      
      const { destination, budget, travelStyle, interests, amenities, travelers } = req.body;
      
      console.log("Extracted hotel data:", { destination, budget, travelStyle, interests, amenities, travelers });
      
      const hotels = await aiTravelPlanner.getPersonalizedHotelRecommendations({
        destination,
        budget,
        travelStyle,
        interests,
        amenities,
        travelers
      });
      res.json({ hotels });
    } catch (error) {
      console.error("AI hotel recommendations error:", error);
      res.status(500).json({ message: "Failed to get hotel recommendations" });
    }
  });

  app.post("/api/ai/hidden-gems", async (req, res) => {
    try {
      console.log("Received request body:", req.body);
      console.log("Request headers:", req.headers);
      console.log("Content-Type:", req.headers['content-type']);
      
      const { destination, interests, budget, travelStyle, duration } = req.body;
      
      console.log("Extracted data:", { destination, interests, budget, travelStyle, duration });
      
      const hiddenGems = await aiTravelPlanner.discoverHiddenGems(destination, {
        interests,
        budget,
        travelStyle,
        duration
      });
      res.json({ hiddenGems });
    } catch (error) {
      console.error("AI hidden gems discovery error:", error);
      res.status(500).json({ message: "Failed to discover hidden gems" });
    }
  });

  app.post("/api/ai/analyze-sentiment", async (req, res) => {
    try {
      const { reviews } = req.body;
      const sentimentAnalysis = await aiTravelPlanner.analyzeReviewSentiment(reviews);
      res.json(sentimentAnalysis);
    } catch (error) {
      console.error("AI sentiment analysis error:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  // Places autocomplete proxy (keeps API key secret)
  app.get('/api/places/autocomplete', async (req, res) => {
    try {
      const input = req.query.input as string | undefined;
      if (!input || !input.trim()) return res.status(400).json({ predictions: [] });

      const mapsKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!mapsKey) return res.status(500).json({ message: 'Google Maps API key not configured on server' });

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&key=${mapsKey}`;
      const r = await fetch(url);
      const json = await r.json();

      if (json?.status === 'REQUEST_DENIED' || !Array.isArray(json?.predictions) || json.predictions.length === 0) {
        const cities = await loadFallbackCities();
        const query = input.toLowerCase().trim();
        const fallbackPredictions = cities
          .filter((city) => `${city.name}, ${city.state}`.toLowerCase().includes(query) || city.name.toLowerCase().includes(query))
          .slice(0, 12)
          .map((city, index) => ({
            description: `${city.name}, ${city.state}`,
            place_id: `fallback-${index}-${city.name.toLowerCase().replace(/\s+/g, '-')}`,
          }));

        return res.json({
          status: 'OK',
          predictions: fallbackPredictions,
          source: 'fallback-cities',
        });
      }

      // Forward the Google response (predictions array)
      return res.json(json);
    } catch (error) {
      console.error('Places autocomplete error:', error);
      res.status(500).json({ message: 'Failed to get place predictions' });
    }
  });

  // Place details proxy (optional)
  app.get('/api/places/details', async (req, res) => {
    try {
      const placeId = req.query.placeId as string | undefined;
      if (!placeId) return res.status(400).json({ result: null });

      const mapsKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!mapsKey) return res.status(500).json({ message: 'Google Maps API key not configured on server' });

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=place_id,name,formatted_address,geometry,address_components&key=${mapsKey}`;
      const r = await fetch(url);
      const json = await r.json();
      return res.json(json);
    } catch (error) {
      console.error('Place details error:', error);
      res.status(500).json({ message: 'Failed to get place details' });
    }
  });

  // Weather forecast
  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const { destination, startDate, endDate, latitude, longitude } = req.query;

      if (!destination || !startDate || !endDate) {
        return res.status(400).json({
          message: "destination, startDate, and endDate are required",
        });
      }

      const forecast = await weatherService.getWeatherForecast(
        destination as string,
        startDate as string,
        endDate as string,
        latitude ? Number(latitude) : undefined,
        longitude ? Number(longitude) : undefined
      );

      res.json({ forecast });
    } catch (error) {
      console.error("Weather forecast error:", error);
      res.status(500).json({ message: "Failed to fetch weather forecast" });
    }
  });

}
