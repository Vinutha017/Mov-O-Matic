import { useMemo, useState } from "react";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, MapPin, RefreshCw, ShieldCheck, TrainFront, Plane, Hotel, CheckCircle2 } from "lucide-react";

type ProviderType = "hotel" | "flight" | "train";

type BookingOffer = {
  id: string;
  title: string;
  description?: string;
  totalAmount: number | string;
  currency?: string;
  providerName?: string;
  providerType?: ProviderType;
  status?: string;
  expiresAt?: string;
};

type AvailabilityResponse = {
  id: string;
  providerType: ProviderType;
  searchKey: string;
  payload?: {
    offers?: BookingOffer[];
  };
  expiresAt?: string;
};

type QuoteResponse = {
  id: string;
  title: string;
  description?: string;
  totalAmount: number | string;
  currency?: string;
  travelers?: number;
  expiresAt?: string;
};

type BookingResponse = {
  id: string;
  status?: string;
  bookingReference?: string;
  totalAmount?: number | string;
  currency?: string;
};

const defaultForms: Record<ProviderType, Record<string, string>> = {
  hotel: {
    providerName: "Planora Hotels",
    origin: "",
    destination: "Goa",
    startDate: "2026-06-10",
    endDate: "2026-06-13",
    travelers: "2",
    currency: "INR"
  },
  flight: {
    providerName: "Planora Air",
    origin: "Delhi",
    destination: "Mumbai",
    travelDate: "2026-06-10",
    travelers: "1",
    currency: "INR"
  },
  train: {
    providerName: "Planora Rail",
    origin: "Delhi",
    destination: "Jaipur",
    travelDate: "2026-06-12",
    travelers: "2",
    currency: "INR"
  }
};

function formatAmount(amount: number | string | undefined, currency: string | undefined = "INR") {
  const value = Number(amount ?? 0);
  const safeCurrency = (currency ?? "INR").trim().toUpperCase();
  
  // Validate currency code is exactly 3 letters
  if (!/^[A-Z]{3}$/.test(safeCurrency)) {
    console.warn(`Invalid currency code: ${safeCurrency}, using INR`);
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
  }
  
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: safeCurrency }).format(value);
}

function providerIcon(providerType: ProviderType) {
  switch (providerType) {
    case "hotel":
      return <Hotel className="h-4 w-4" />;
    case "flight":
      return <Plane className="h-4 w-4" />;
    case "train":
      return <TrainFront className="h-4 w-4" />;
  }
}

export default function Bookings() {
  const [providerType, setProviderType] = useState<ProviderType>("hotel");
  const [formValues, setFormValues] = useState<Record<ProviderType, Record<string, string>>>(defaultForms);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ booking: BookingResponse; payment: { id: string; providerPaymentId?: string; status?: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentForm = formValues[providerType];

  const offers = useMemo(() => availability?.payload?.offers ?? [], [availability]);

  const updateField = (field: string, value: string) => {
    setFormValues((previous) => ({
      ...previous,
      [providerType]: {
        ...previous[providerType],
        [field]: value,
      },
    }));
  };

  const buildPayload = () => ({
    providerType,
    providerName: currentForm.providerName,
    origin: currentForm.origin || undefined,
    destination: currentForm.destination,
    startDate: currentForm.startDate || undefined,
    endDate: currentForm.endDate || undefined,
    travelDate: currentForm.travelDate || undefined,
    travelers: Number(currentForm.travelers || 1),
    currency: currentForm.currency || "INR",
  });

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);
    setPaymentResult(null);
    try {
      const payload = buildPayload();
      console.log("Loading availability with payload:", payload);
      const response = await apiRequest("POST", "/api/bookings/availability", payload);
      const data = (await response.json()) as AvailabilityResponse;
      console.log("Availability loaded:", data);
      setAvailability(data);
      setSelectedOfferId(data.payload?.offers?.[0]?.id ?? null);
      setQuote(null);
      setBooking(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load availability";
      console.error("Availability error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload();
      console.log("Creating quote with payload:", payload);
      const response = await apiRequest("POST", "/api/bookings/quote", payload);
      const data = (await response.json()) as QuoteResponse;
      console.log("Quote created:", data);
      setQuote(data);
      setSelectedOfferId(data.id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create quote";
      console.error("Quote error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async () => {
    if (!quote) {
      setError("Generate a quote before creating a booking.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        quoteId: quote.id,
        ...buildPayload(),
        status: "hold_pending",
        totalAmount: Number(quote.totalAmount || 0),
        holdExpiresAt: quote.expiresAt,
      };
      console.log("Creating booking with payload:", payload);
      const response = await apiRequest("POST", "/api/bookings", payload);
      const data = (await response.json()) as BookingResponse;
      console.log("Booking created:", data);
      setBooking(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create booking";
      console.error("Booking error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const capturePayment = async () => {
    if (!booking) {
      setError("Create a booking before taking payment.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        provider: "stripe",
        method: "card",
        currency: booking.currency ?? currentForm.currency ?? "INR",
      };
      console.log("Capturing payment with payload:", payload);
      const response = await apiRequest("POST", `/api/bookings/${booking.id}/payments`, payload);
      const data = await response.json();
      console.log("Payment captured:", data);
      setPaymentResult(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to capture payment";
      console.error("Payment error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const activeOffer = offers.find((offer) => offer.id === selectedOfferId) ?? offers[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff,_#ffffff)]">
      <Header />

      <main className="travel-container py-8 md:py-12">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" className="px-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Booking workspace
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-white/60 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <CardHeader className="space-y-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-orange-50">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Book hotels, flights, and trains</CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Search live availability, create a quote, place a hold, and collect payment in one flow.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <Tabs value={providerType} onValueChange={(value) => setProviderType(value as ProviderType)}>
                <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-slate-100 p-1">
                  <TabsTrigger value="hotel" className="rounded-xl">
                    <span className="mr-2 inline-flex items-center">{providerIcon("hotel")}</span>
                    Hotel
                  </TabsTrigger>
                  <TabsTrigger value="flight" className="rounded-xl">
                    <span className="mr-2 inline-flex items-center">{providerIcon("flight")}</span>
                    Flight
                  </TabsTrigger>
                  <TabsTrigger value="train" className="rounded-xl">
                    <span className="mr-2 inline-flex items-center">{providerIcon("train")}</span>
                    Train
                  </TabsTrigger>
                </TabsList>

                {(["hotel", "flight", "train"] as ProviderType[]).map((type) => (
                  <TabsContent key={type} value={type} className="mt-6 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Provider name</Label>
                        <Input value={formValues[type].providerName} onChange={(event) => updateField("providerName", event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Travelers</Label>
                        <Input type="number" min="1" value={formValues[type].travelers} onChange={(event) => updateField("travelers", event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Origin</Label>
                        <Input value={formValues[type].origin} onChange={(event) => updateField("origin", event.target.value)} placeholder="Departure city" />
                      </div>
                      <div className="space-y-2">
                        <Label>Destination</Label>
                        <Input value={formValues[type].destination} onChange={(event) => updateField("destination", event.target.value)} placeholder="Arrival city or stay location" />
                      </div>
                      {type === "hotel" ? (
                        <>
                          <div className="space-y-2">
                            <Label>Check-in</Label>
                            <Input type="date" value={formValues[type].startDate} onChange={(event) => updateField("startDate", event.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Check-out</Label>
                            <Input type="date" value={formValues[type].endDate} onChange={(event) => updateField("endDate", event.target.value)} />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Label>Travel date</Label>
                          <Input type="date" value={formValues[type].travelDate} onChange={(event) => updateField("travelDate", event.target.value)} />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input value={formValues[type].currency} onChange={(event) => updateField("currency", event.target.value)} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={loadAvailability} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Search availability
                      </Button>
                      <Button variant="secondary" onClick={createQuote} disabled={loading}>
                        Create quote
                      </Button>
                      <Button variant="outline" onClick={createBooking} disabled={loading || !quote}>
                        Reserve booking
                      </Button>
                      <Button variant="outline" onClick={capturePayment} disabled={loading || !booking}>
                        Take payment
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Availability</p>
                  <p className="mt-2 text-sm text-slate-700">{availability ? `Live snapshot ${availability.searchKey}` : "No search yet"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quote</p>
                  <p className="mt-2 text-sm text-slate-700">{quote ? `${quote.title} · ${formatAmount(quote.totalAmount, quote.currency)}` : "No quote yet"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Booking</p>
                  <p className="mt-2 text-sm text-slate-700">{booking ? `${booking.status ?? "pending"} · ${booking.bookingReference ?? booking.id}` : "No booking yet"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/60 bg-slate-950 text-white shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                  Booking summary
                </CardTitle>
                <CardDescription className="text-slate-300">This card reflects the live quote and booking status for the selected provider.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      {providerIcon(providerType)}
                      <span className="capitalize">{providerType}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                      {activeOffer?.status ?? "available"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-lg font-semibold">{activeOffer?.title ?? "No offer selected"}</p>
                  <p className="mt-1 text-sm text-slate-300">{activeOffer?.description ?? "Run a search to load offers."}</p>
                </div>

                <div className="space-y-3 text-sm text-slate-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <span>{currentForm.origin || "Origin not set"} → {currentForm.destination}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <span>{quote ? formatAmount(quote.totalAmount, quote.currency) : activeOffer ? formatAmount(activeOffer.totalAmount, activeOffer.currency) : "Awaiting quote"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <span>{paymentResult ? `Paid via ${paymentResult.payment.providerPaymentId ?? paymentResult.payment.id}` : booking ? "Payment pending" : "Booking not reserved yet"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Results</CardTitle>
                <CardDescription>Availability snapshots and confirmed booking state appear here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Offers</p>
                  <div className="mt-3 space-y-3">
                    {offers.length ? offers.map((offer) => (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => setSelectedOfferId(offer.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${selectedOfferId === offer.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{offer.title}</p>
                            <p className={`text-sm ${selectedOfferId === offer.id ? "text-slate-200" : "text-slate-500"}`}>{offer.description}</p>
                          </div>
                          <div className="text-right text-sm font-semibold">
                            {formatAmount(offer.totalAmount, offer.currency)}
                          </div>
                        </div>
                      </button>
                    )) : (
                      <p className="text-sm text-slate-500">Search availability to see live offers.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment outcome</p>
                  <pre className="mt-3 overflow-auto text-xs leading-5 text-slate-700">
                    {paymentResult ? JSON.stringify(paymentResult, null, 2) : "No payment captured yet."}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}