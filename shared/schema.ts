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

export const bookingQuotes = pgTable("booking_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id),
  providerType: text("provider_type").notNull(),
  providerName: text("provider_name").notNull(),
  searchKey: text("search_key").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  travelers: integer("travelers").default(1),
  expiresAt: timestamp("expires_at"),
  providerPayload: jsonb("provider_payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  tripId: varchar("trip_id").references(() => trips.id),
  quoteId: varchar("quote_id").references(() => bookingQuotes.id),
  providerType: text("provider_type").notNull(),
  providerName: text("provider_name").notNull(),
  providerReservationId: text("provider_reservation_id"),
  bookingReference: text("booking_reference"),
  status: text("status").default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  travelDate: timestamp("travel_date"),
  travelers: integer("travelers").default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  currency: text("currency").default("INR"),
  holdExpiresAt: timestamp("hold_expires_at"),
  contactDetails: jsonb("contact_details"),
  providerPayload: jsonb("provider_payload"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  provider: text("provider").notNull(),
  providerPaymentId: text("provider_payment_id"),
  status: text("status").default("initiated"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("INR"),
  method: text("method"),
  idempotencyKey: text("idempotency_key").unique(),
  metadata: jsonb("metadata"),
  authorizedAt: timestamp("authorized_at"),
  capturedAt: timestamp("captured_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const availabilitySnapshots = pgTable("availability_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerType: text("provider_type").notNull(),
  providerName: text("provider_name").notNull(),
  searchKey: text("search_key").notNull(),
  status: text("status").default("available"),
  payload: jsonb("payload"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertBookingQuoteSchema = createInsertSchema(bookingQuotes).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailabilitySnapshotSchema = createInsertSchema(availabilitySnapshots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type BookingQuote = typeof bookingQuotes.$inferSelect;
export type InsertBookingQuote = z.infer<typeof insertBookingQuoteSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type AvailabilitySnapshot = typeof availabilitySnapshots.$inferSelect;
export type InsertAvailabilitySnapshot = z.infer<typeof insertAvailabilitySnapshotSchema>;

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
  transportPreferences?: string[];
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
  destinationCompatibility?: {
    unavailableInterests: string[];
    unavailableFoods: string[];
    unavailableActivities: string[];
    alternativeSuggestions: string[];
    compatibilityNote: string;
  };
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

export interface AITripAssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface AITripAssistantRequest {
  message: string;
  tripContext?: {
    title?: string;
    destination?: string;
    startLocation?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    travelers?: number;
    tripType?: string;
    travelStyle?: string;
    interests?: string[];
    transportPreferences?: string[];
    accommodationAmenities?: string[];
    summary?: string;
  };
  conversationHistory?: AITripAssistantMessage[];
}

export interface AITripAssistantResponse {
  reply: string;
  suggestions: string[];
  contextUsed: string[];
}

export interface RecommendationCard {
  id: string;
  title: string;
  description: string;
  score: number;
  reason: string;
  category: 'hotel' | 'activity' | 'restaurant' | 'destination';
  metadata?: Record<string, unknown>;
}

export interface TripRecommendationResponse {
  hotels: RecommendationCard[];
  activities: RecommendationCard[];
  restaurants: RecommendationCard[];
  destinations: RecommendationCard[];
  seasonalTips: string[];
  summary: string;
}
