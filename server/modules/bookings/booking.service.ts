import { randomUUID } from "crypto";
import { storage } from "../../storage";
import { mockPaymentGateway } from "../../integrations/payments/payment-adapter";
import type {
  AvailabilitySnapshot,
  Booking,
  BookingQuote,
  InsertAvailabilitySnapshot,
  InsertBooking,
  InsertBookingQuote,
  InsertPayment,
  Payment
} from "@shared/schema";

export type BookingProviderType = "hotel" | "flight" | "train";

export interface BookingSearchInput {
  providerType: BookingProviderType;
  providerName?: string;
  origin?: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  travelDate?: string;
  travelers: number;
  currency?: string;
}

export interface CreateBookingInput {
  booking: InsertBooking;
  quoteId?: string;
}

export interface CapturePaymentInput {
  bookingId: string;
  amount?: number;
  currency?: string;
  method?: string;
  provider?: string;
  idempotencyKey?: string;
}

function normalizeValue(value?: string): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, "-");
}

export function buildSearchKey(input: BookingSearchInput): string {
  return [
    normalizeValue(input.providerType),
    normalizeValue(input.origin),
    normalizeValue(input.destination),
    normalizeValue(input.startDate),
    normalizeValue(input.endDate),
    normalizeValue(input.travelDate),
    String(input.travelers)
  ].join(":");
}

function buildMockOffers(input: BookingSearchInput) {
  const providerLabel = input.providerName ?? "Planora Network";
  const basePrice = input.providerType === "flight" ? 6400 : input.providerType === "train" ? 2200 : 4800;

  return [
    {
      id: `${input.providerType}-offer-1`,
      title: `${providerLabel} Saver Option`,
      description: `Flexible ${input.providerType} booking for ${input.destination}`,
      totalAmount: basePrice,
      currency: input.currency ?? "INR",
      providerName: providerLabel,
      providerType: input.providerType,
      status: "available",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    },
    {
      id: `${input.providerType}-offer-2`,
      title: `${providerLabel} Flex Option`,
      description: `Higher flexibility with priority support`,
      totalAmount: basePrice + 1350,
      currency: input.currency ?? "INR",
      providerName: providerLabel,
      providerType: input.providerType,
      status: "limited",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }
  ];
}

export async function syncAvailability(input: BookingSearchInput): Promise<AvailabilitySnapshot> {
  const searchKey = buildSearchKey(input);
  const cachedSnapshot = await storage.getAvailabilitySnapshot(searchKey);

  if (cachedSnapshot && (!cachedSnapshot.expiresAt || new Date(cachedSnapshot.expiresAt) > new Date())) {
    return cachedSnapshot;
  }

  const snapshotPayload = {
    search: input,
    offers: buildMockOffers(input),
    lastSyncedAt: new Date().toISOString()
  };

  return storage.upsertAvailabilitySnapshot({
    providerType: input.providerType,
    providerName: input.providerName ?? "Planora Network",
    searchKey,
    status: "available",
    payload: snapshotPayload,
    fetchedAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });
}

export async function createBookingQuote(input: BookingSearchInput): Promise<BookingQuote> {
  const snapshot = await syncAvailability(input);
  const offers = (snapshot.payload as { offers?: Array<Record<string, unknown>> } | null | undefined)?.offers ?? [];
  const offer = offers[0] ?? null;

  const quote: InsertBookingQuote = {
    bookingId: null,
    providerType: input.providerType,
    providerName: input.providerName ?? "Planora Network",
    searchKey: buildSearchKey(input),
    title: (offer?.title as string | undefined) ?? `${input.providerType} option for ${input.destination}`,
    description: (offer?.description as string | undefined) ?? `Live quote for ${input.destination}`,
    totalAmount: String((offer?.totalAmount as number | undefined) ?? (input.providerType === "flight" ? 6400 : 4800)),
    currency: (offer?.currency as string | undefined) ?? input.currency ?? "INR",
    travelers: input.travelers,
    expiresAt: offer?.expiresAt ? new Date(String(offer.expiresAt)) : new Date(Date.now() + 15 * 60 * 1000),
    providerPayload: snapshot.payload
  };

  return storage.createBookingQuote(quote);
}

export async function createBookingRecord(input: CreateBookingInput): Promise<Booking> {
  const quote = input.quoteId ? await storage.getBookingQuote(input.quoteId) : undefined;

  return storage.createBooking({
    ...input.booking,
    quoteId: input.quoteId ?? input.booking.quoteId ?? null,
    status: input.booking.status ?? (quote ? "hold_pending" : "draft"),
    totalAmount: input.booking.totalAmount ?? quote?.totalAmount ?? null,
    currency: input.booking.currency ?? quote?.currency ?? "INR",
    travelers: input.booking.travelers ?? quote?.travelers ?? 1,
    providerPayload: input.booking.providerPayload ?? quote?.providerPayload ?? null,
    holdExpiresAt: input.booking.holdExpiresAt ?? quote?.expiresAt ?? null
  });
}

export async function captureBookingPayment(input: CapturePaymentInput): Promise<{ booking: Booking; payment: Payment }> {
  const booking = await storage.getBooking(input.bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  const paymentAmount = input.amount ?? Number(booking.totalAmount ?? 0);
  const currency = input.currency ?? booking.currency ?? "INR";
  const provider = input.provider ?? "stripe";
  const gatewayResult = await mockPaymentGateway.capturePayment({
    bookingId: booking.id,
    amount: paymentAmount,
    currency,
    method: input.method ?? "card",
    idempotencyKey: input.idempotencyKey
  });

  const payment = await storage.createPayment({
    bookingId: booking.id,
    provider,
    providerPaymentId: gatewayResult.providerPaymentId,
    status: gatewayResult.status,
    amount: String(paymentAmount),
    currency,
    method: input.method ?? "card",
    idempotencyKey: input.idempotencyKey ?? randomUUID(),
    metadata: gatewayResult.metadata,
    authorizedAt: new Date(),
    capturedAt: new Date(),
    refundedAt: null
  });

  const updatedBooking = await storage.updateBooking(booking.id, {
    status: "confirmed",
    providerReservationId: gatewayResult.providerPaymentId,
    bookingReference: booking.bookingReference ?? gatewayResult.providerPaymentId,
    totalAmount: booking.totalAmount ?? String(paymentAmount),
    currency
  });

  if (!updatedBooking) {
    throw new Error("Failed to update booking status");
  }

  return { booking: updatedBooking, payment };
}

export async function listBookingPayments(bookingId: string): Promise<Payment[]> {
  return storage.getPaymentsByBookingId(bookingId);
}

export async function getBookingById(bookingId: string): Promise<Booking | undefined> {
  return storage.getBooking(bookingId);
}

export async function listBookingsByUserId(userId: string): Promise<Booking[]> {
  return storage.getBookingsByUserId(userId);
}