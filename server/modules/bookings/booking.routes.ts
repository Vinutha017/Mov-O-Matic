import type { Express } from "express";
import { z } from "zod";
import {
  captureBookingPayment,
  createBookingQuote,
  createBookingRecord,
  getBookingById,
  listBookingPayments,
  listBookingsByUserId,
  syncAvailability
} from "./booking.service";

const providerTypeSchema = z.enum(["hotel", "flight", "train"]);

const bookingSearchSchema = z.object({
  providerType: providerTypeSchema,
  providerName: z.string().min(1).optional(),
  origin: z.string().optional(),
  destination: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  travelDate: z.string().optional(),
  travelers: z.coerce.number().int().positive().default(1),
  currency: z.string().default("INR")
});

const bookingCreateSchema = z.object({
  quoteId: z.string().optional(),
  userId: z.string().optional(),
  tripId: z.string().optional(),
  providerType: providerTypeSchema,
  providerName: z.string().min(1),
  providerReservationId: z.string().optional(),
  bookingReference: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  travelDate: z.string().optional(),
  travelers: z.coerce.number().int().positive().default(1),
  totalAmount: z.coerce.number().positive().optional(),
  currency: z.string().default("INR"),
  holdExpiresAt: z.string().optional(),
  contactDetails: z.record(z.string(), z.any()).optional(),
  providerPayload: z.record(z.string(), z.any()).optional()
});

const paymentCreateSchema = z.object({
  provider: z.string().default("stripe"),
  method: z.string().default("card"),
  amount: z.coerce.number().positive().optional(),
  currency: z.string().default("INR"),
  idempotencyKey: z.string().min(8).optional()
});

export async function registerBookingRoutes(app: Express): Promise<void> {
  app.post("/api/bookings/availability", async (req, res) => {
    try {
      const search = bookingSearchSchema.parse(req.body);
      const snapshot = await syncAvailability(search);
      res.json(snapshot);
    } catch (error) {
      console.error("Availability search error:", error);
      res.status(400).json({ message: "Failed to sync availability" });
    }
  });

  app.post("/api/bookings/quote", async (req, res) => {
    try {
      const search = bookingSearchSchema.parse(req.body);
      const quote = await createBookingQuote(search);
      res.json(quote);
    } catch (error) {
      console.error("Quote generation error:", error);
      res.status(400).json({ message: "Failed to generate booking quote" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      console.log("POST /api/bookings request body:", req.body);
      const body = bookingCreateSchema.parse(req.body);
      console.log("Parsed booking body:", body);
      const booking = await createBookingRecord({
        quoteId: body.quoteId,
        booking: {
          userId: body.userId ?? null,
          tripId: body.tripId ?? null,
          quoteId: body.quoteId ?? null,
          providerType: body.providerType,
          providerName: body.providerName,
          providerReservationId: body.providerReservationId ?? null,
          bookingReference: body.bookingReference ?? null,
          status: body.status ?? null,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          travelDate: body.travelDate ? new Date(body.travelDate) : null,
          travelers: body.travelers,
          totalAmount: body.totalAmount !== undefined ? String(body.totalAmount) : null,
          currency: body.currency,
          holdExpiresAt: body.holdExpiresAt ? new Date(body.holdExpiresAt) : null,
          contactDetails: body.contactDetails ?? null,
          providerPayload: body.providerPayload ?? null
        }
      });

      console.log("Booking created successfully:", booking);
      res.json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;

      if (!userId) {
        return res.status(400).json({ message: "userId query parameter is required" });
      }

      const bookings = await listBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      console.error("List bookings error:", error);
      res.status(500).json({ message: "Failed to retrieve bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await getBookingById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Failed to retrieve booking" });
    }
  });

  app.post("/api/bookings/:id/payments", async (req, res) => {
    try {
      const body = paymentCreateSchema.parse(req.body);
      const result = await captureBookingPayment({
        bookingId: req.params.id,
        amount: body.amount,
        currency: body.currency,
        method: body.method,
        provider: body.provider,
        idempotencyKey: body.idempotencyKey
      });

      res.json(result);
    } catch (error) {
      console.error("Capture payment error:", error);
      res.status(400).json({ message: "Failed to capture payment" });
    }
  });

  app.get("/api/bookings/:id/payments", async (req, res) => {
    try {
      const payments = await listBookingPayments(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error("List booking payments error:", error);
      res.status(500).json({ message: "Failed to retrieve payments" });
    }
  });
}