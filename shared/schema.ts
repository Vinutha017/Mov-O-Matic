import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  currency: text("currency").default("INR"),
  travelers: integer("travelers").default(1),
  travelStyle: text("travel_style"), // adventure, culture, leisure, business
  preferences: jsonb("preferences"), // interests, dietary restrictions, etc.
  status: text("status").default("draft"), // draft, active, completed
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const itineraryDays = pgTable("itinerary_days", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  dayNumber: integer("day_number").notNull(),
  date: timestamp("date"),
  title: text("title"),
  notes: text("notes"),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayId: varchar("day_id").references(() => itineraryDays.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  address: text("address"),
  coordinates: jsonb("coordinates"), // { lat, lng }
  startTime: text("start_time"),
  endTime: text("end_time"),
  duration: integer("duration"), // in minutes
  cost: decimal("cost", { precision: 10, scale: 2 }),
  category: text("category"), // attraction, restaurant, hotel, transport
  priority: integer("priority").default(1),
  bookingUrl: text("booking_url"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
});

export const hotels = pgTable("hotels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  coordinates: jsonb("coordinates"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }),
  currency: text("currency").default("INR"),
  amenities: jsonb("amenities"), // array of strings
  images: jsonb("images"), // array of image URLs
  description: text("description"),
  aiInsight: text("ai_insight"),
  bookingUrl: text("booking_url"),
});

export const destinations = pgTable("destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description"),
  image: text("image"),
  category: text("category"), // culture, adventure, beach, mountain, city
  rating: decimal("rating", { precision: 2, scale: 1 }),
  popularityScore: integer("popularity_score").default(0),
  bestTimeToVisit: text("best_time_to_visit"),
  averageBudget: decimal("average_budget", { precision: 10, scale: 2 }),
  coordinates: jsonb("coordinates"),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  activityId: varchar("activity_id").references(() => activities.id),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  category: text("category"), // food, transport, accommodation, activities, shopping, other
  date: timestamp("date").defaultNow(),
  notes: text("notes"),
});

export const weatherAlerts = pgTable("weather_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  condition: text("condition"), // rain, storm, extreme_heat, etc.
  severity: text("severity"), // low, medium, high
  message: text("message"),
  suggestions: jsonb("suggestions"), // array of suggested changes
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItineraryDaySchema = createInsertSchema(itineraryDays).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
});

export const insertWeatherAlertSchema = createInsertSchema(weatherAlerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type ItineraryDay = typeof itineraryDays.$inferSelect;
export type InsertItineraryDay = z.infer<typeof insertItineraryDaySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type WeatherAlert = typeof weatherAlerts.$inferSelect;
export type InsertWeatherAlert = z.infer<typeof insertWeatherAlertSchema>;

// Complex types
export interface TripWithDetails extends Trip {
  days: (ItineraryDay & { activities: Activity[] })[];
  expenses: Expense[];
  weatherAlerts: WeatherAlert[];
}

export interface AITripRequest {
  description: string;
  destination?: string;
  startLocation?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  budget?: number;
  travelers?: number;
  tripType?: string;
  modeOfTravel?: string;
  preferredDepartureTime?: string;
  hotelType?: string;
  roomType?: string;
  foodPreferences?: string[];
  activityTypes?: string[];
  tripTheme?: string;
  interests?: string[];
  transportPreferences?: string[];
  travelStyle?: string;
  accommodationAmenities?: string[];
  mobilityRequirements?: string;
  specialRequirements?: string;
}

export interface AIRecommendation {
  hotels: Hotel[];
  attractions: Activity[];
  restaurants: Activity[];
  itinerary: {
    day: number;
    activities: Activity[];
    estimatedCost: number;
  }[];
  totalEstimatedCost: number;
  tips: string[];
}

// New AI Recommendation Types
export interface PersonalizedHotelRecommendation extends Hotel {
  pros: string[];
  cons: string[];
  bestFor: string;
  localTips: string;
}

export interface HiddenGem extends Activity {
  whyHidden: string;
  localInsight: string;
  bestTimeToVisit: string;
  crowdLevel: 'low' | 'medium' | 'high';
  authenticity: string;
  photoOpportunity: string;
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keyInsights: string[];
  commonThemes: string[];
  recommendations: string[];
}

export interface AIRecommendationPreferences {
  destination: string;
  budget: number;
  travelStyle: string;
  interests: string[];
  amenities?: string[];
  travelers: number;
  duration?: number;
}
