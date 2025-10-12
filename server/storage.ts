import { 
  type User, 
  type InsertUser, 
  type Trip, 
  type InsertTrip,
  type ItineraryDay,
  type InsertItineraryDay,
  type Activity,
  type InsertActivity,
  type Hotel,
  type InsertHotel,
  type Destination,
  type InsertDestination,
  type Expense,
  type InsertExpense,
  type WeatherAlert,
  type InsertWeatherAlert,
  type TripWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trips
  getTrip(id: string): Promise<Trip | undefined>;
  getTripWithDetails(id: string): Promise<TripWithDetails | undefined>;
  getTripsByUserId(userId: string): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;

  // Itinerary Days
  getItineraryDaysByTripId(tripId: string): Promise<ItineraryDay[]>;
  createItineraryDay(day: InsertItineraryDay): Promise<ItineraryDay>;
  updateItineraryDay(id: string, day: Partial<ItineraryDay>): Promise<ItineraryDay | undefined>;
  deleteItineraryDay(id: string): Promise<boolean>;

  // Activities
  getActivitiesByDayId(dayId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, activity: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<boolean>;

  // Hotels
  getHotels(): Promise<Hotel[]>;
  getHotelsByLocation(location: string): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;

  // Destinations
  getDestinations(): Promise<Destination[]>;
  getPopularDestinations(limit?: number): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;

  // Expenses
  getExpensesByTripId(tripId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // Weather Alerts
  getWeatherAlertsByTripId(tripId: string): Promise<WeatherAlert[]>;
  createWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert>;
  markWeatherAlertAsRead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private trips: Map<string, Trip> = new Map();
  private itineraryDays: Map<string, ItineraryDay> = new Map();
  private activities: Map<string, Activity> = new Map();
  private hotels: Map<string, Hotel> = new Map();
  private destinations: Map<string, Destination> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private weatherAlerts: Map<string, WeatherAlert> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed popular destinations
    const destinations = [
      {
        id: "dest-1",
        name: "Agra",
        country: "India",
        description: "Home to the magnificent Taj Mahal and rich Mughal heritage",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
        category: "culture",
        rating: "4.8",
        popularityScore: 95,
        bestTimeToVisit: "October to March",
        averageBudget: "15000",
        coordinates: { lat: 27.1767, lng: 78.0081 }
      },
      {
        id: "dest-2",
        name: "Kerala",
        country: "India",
        description: "God's Own Country with backwaters and spice plantations",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
        category: "nature",
        rating: "4.9",
        popularityScore: 90,
        bestTimeToVisit: "September to March",
        averageBudget: "20000",
        coordinates: { lat: 10.8505, lng: 76.2711 }
      },
      {
        id: "dest-3",
        name: "Goa",
        country: "India",
        description: "Tropical paradise with pristine beaches and vibrant nightlife",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
        category: "beach",
        rating: "4.7",
        popularityScore: 85,
        bestTimeToVisit: "November to February",
        averageBudget: "18000",
        coordinates: { lat: 15.2993, lng: 74.1240 }
      },
      {
        id: "dest-4",
        name: "Manali",
        country: "India",
        description: "Himalayan hill station perfect for adventure and relaxation",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
        category: "mountain",
        rating: "4.6",
        popularityScore: 80,
        bestTimeToVisit: "March to June, October to February",
        averageBudget: "16000",
        coordinates: { lat: 32.2432, lng: 77.1892 }
      }
    ];

    destinations.forEach(dest => {
      this.destinations.set(dest.id, dest as Destination);
    });

    // Seed hotels
    const hotels = [
      {
        id: "hotel-1",
        name: "The Heritage Palace",
        location: "Jaipur City Center",
        address: "Near City Palace, Jaipur, Rajasthan",
        coordinates: { lat: 26.9124, lng: 75.7873 },
        rating: "4.8",
        pricePerNight: "4500",
        currency: "INR",
        amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Heritage Architecture"],
        images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"],
        description: "Experience royal luxury in this heritage palace hotel",
        aiInsight: "Perfect for culture enthusiasts - walking distance to major heritage sites",
        bookingUrl: "https://example.com/booking"
      },
      {
        id: "hotel-2",
        name: "Boutique Retreat",
        location: "Peaceful Location",
        address: "2km from city center",
        coordinates: { lat: 26.9000, lng: 75.7800 },
        rating: "4.6",
        pricePerNight: "2800",
        currency: "INR",
        amenities: ["Free WiFi", "Restaurant", "Garden", "Room Service"],
        images: ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"],
        description: "Modern comfort in a serene setting",
        aiInsight: "Great value for budget-conscious travelers seeking comfort",
        bookingUrl: "https://example.com/booking"
      },
      {
        id: "hotel-3",
        name: "Royal Heritage Resort",
        location: "Historic Palace",
        address: "Converted palace in heritage district",
        coordinates: { lat: 26.9200, lng: 75.7900 },
        rating: "4.9",
        pricePerNight: "8500",
        currency: "INR",
        amenities: ["Free WiFi", "Royal Spa", "Heritage Tours", "Fine Dining", "Traditional Performances"],
        images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"],
        description: "Ultimate luxury in an authentic palace setting",
        aiInsight: "Ultimate luxury experience for special occasions and cultural immersion",
        bookingUrl: "https://example.com/booking"
      }
    ];

    hotels.forEach(hotel => {
      this.hotels.set(hotel.id, hotel as Hotel);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Trips
  async getTrip(id: string): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripWithDetails(id: string): Promise<TripWithDetails | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;

    const days = await this.getItineraryDaysByTripId(id);
    const daysWithActivities = await Promise.all(
      days.map(async (day) => ({
        ...day,
        activities: await this.getActivitiesByDayId(day.id)
      }))
    );

    const expenses = await this.getExpensesByTripId(id);
    const weatherAlerts = await this.getWeatherAlertsByTripId(id);

    return {
      ...trip,
      days: daysWithActivities,
      expenses,
      weatherAlerts
    };
  }

  async getTripsByUserId(userId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.userId === userId);
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const trip: Trip = {
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertTrip.status ?? null,
      userId: insertTrip.userId ?? null,
      title: insertTrip.title,
      destination: insertTrip.destination,
      description: insertTrip.description ?? null,
      startDate: insertTrip.startDate ?? null,
      endDate: insertTrip.endDate ?? null,
      budget: insertTrip.budget ?? null,
      currency: insertTrip.currency ?? null,
      isPublic: insertTrip.isPublic ?? null,
      travelers: insertTrip.travelers ?? null,
      travelStyle: insertTrip.travelStyle ?? null,
      preferences: insertTrip.preferences ?? null
    };
    this.trips.set(id, trip);
    return trip;
  }

  async updateTrip(id: string, tripUpdate: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;

    const updatedTrip = { ...trip, ...tripUpdate, updatedAt: new Date() };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(id: string): Promise<boolean> {
    return this.trips.delete(id);
  }

  // Itinerary Days
  async getItineraryDaysByTripId(tripId: string): Promise<ItineraryDay[]> {
    return Array.from(this.itineraryDays.values())
      .filter(day => day.tripId === tripId)
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }

  async createItineraryDay(insertDay: InsertItineraryDay): Promise<ItineraryDay> {
    const id = randomUUID();
    const day: ItineraryDay = {
      id,
      tripId: insertDay.tripId,
      dayNumber: insertDay.dayNumber,
      date: insertDay.date ?? null,
      title: insertDay.title ?? null,
      notes: insertDay.notes ?? null
    };
    this.itineraryDays.set(id, day);
    return day;
  }

  async updateItineraryDay(id: string, dayUpdate: Partial<ItineraryDay>): Promise<ItineraryDay | undefined> {
    const day = this.itineraryDays.get(id);
    if (!day) return undefined;

    const updatedDay = { ...day, ...dayUpdate };
    this.itineraryDays.set(id, updatedDay);
    return updatedDay;
  }

  async deleteItineraryDay(id: string): Promise<boolean> {
    return this.itineraryDays.delete(id);
  }

  // Activities
  async getActivitiesByDayId(dayId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.dayId === dayId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      id,
      title: insertActivity.title,
      dayId: insertActivity.dayId,
      description: insertActivity.description ?? null,
      notes: insertActivity.notes ?? null,
      location: insertActivity.location ?? null,
      address: insertActivity.address ?? null,
      coordinates: insertActivity.coordinates ?? null,
      startTime: insertActivity.startTime ?? null,
      endTime: insertActivity.endTime ?? null,
      sortOrder: insertActivity.sortOrder ?? null,
      duration: insertActivity.duration ?? null,
      cost: insertActivity.cost ?? null,
      category: insertActivity.category ?? null,
      priority: insertActivity.priority ?? null,
      bookingUrl: insertActivity.bookingUrl ?? null
    };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: string, activityUpdate: Partial<Activity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;

    const updatedActivity = { ...activity, ...activityUpdate };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: string): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Hotels
  async getHotels(): Promise<Hotel[]> {
    return Array.from(this.hotels.values());
  }

  async getHotelsByLocation(location: string): Promise<Hotel[]> {
    return Array.from(this.hotels.values())
      .filter(hotel => hotel.location.toLowerCase().includes(location.toLowerCase()));
  }

  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    const id = randomUUID();
    const hotel: Hotel = {
      id,
      name: insertHotel.name,
      description: insertHotel.description ?? null,
      currency: insertHotel.currency ?? null,
      location: insertHotel.location,
      address: insertHotel.address ?? null,
      coordinates: insertHotel.coordinates ?? null,
      bookingUrl: insertHotel.bookingUrl ?? null,
      rating: insertHotel.rating ?? null,
      pricePerNight: insertHotel.pricePerNight ?? null,
      amenities: insertHotel.amenities ?? null,
      images: insertHotel.images ?? null,
      aiInsight: insertHotel.aiInsight ?? null
    };
    this.hotels.set(id, hotel);
    return hotel;
  }

  // Destinations
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async getPopularDestinations(limit = 10): Promise<Destination[]> {
    return Array.from(this.destinations.values())
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
      .slice(0, limit);
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = randomUUID();
    const destination: Destination = {
      id,
      name: insertDestination.name,
      description: insertDestination.description ?? null,
      coordinates: insertDestination.coordinates ?? null,
      category: insertDestination.category ?? null,
      rating: insertDestination.rating ?? null,
      country: insertDestination.country,
      image: insertDestination.image ?? null,
      popularityScore: insertDestination.popularityScore ?? null,
      bestTimeToVisit: insertDestination.bestTimeToVisit ?? null,
      averageBudget: insertDestination.averageBudget ?? null
    };
    this.destinations.set(id, destination);
    return destination;
  }

  // Expenses
  async getExpensesByTripId(tripId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.tripId === tripId)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      id,
      date: insertExpense.date ?? new Date(),
      title: insertExpense.title,
      currency: insertExpense.currency ?? null,
      tripId: insertExpense.tripId,
      notes: insertExpense.notes ?? null,
      category: insertExpense.category ?? null,
      activityId: insertExpense.activityId ?? null,
      amount: insertExpense.amount
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, expenseUpdate: Partial<Expense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updatedExpense = { ...expense, ...expenseUpdate };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Weather Alerts
  async getWeatherAlertsByTripId(tripId: string): Promise<WeatherAlert[]> {
    return Array.from(this.weatherAlerts.values())
      .filter(alert => alert.tripId === tripId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createWeatherAlert(insertAlert: InsertWeatherAlert): Promise<WeatherAlert> {
    const id = randomUUID();
    const alert: WeatherAlert = {
      id,
      message: insertAlert.message ?? null,
      date: insertAlert.date,
      createdAt: new Date(),
      tripId: insertAlert.tripId,
      location: insertAlert.location,
      condition: insertAlert.condition ?? null,
      severity: insertAlert.severity ?? null,
      suggestions: insertAlert.suggestions ?? null,
      isRead: insertAlert.isRead ?? null
    };
    this.weatherAlerts.set(id, alert);
    return alert;
  }

  async markWeatherAlertAsRead(id: string): Promise<boolean> {
    const alert = this.weatherAlerts.get(id);
    if (!alert) return false;

    alert.isRead = true;
    this.weatherAlerts.set(id, alert);
    return true;
  }
}

export const storage = new MemStorage();
