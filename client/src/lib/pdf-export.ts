import jsPDF from "jspdf";
import type { Trip } from "@/lib/firebaseService";

type PdfStop = {
  label: string;
  location?: string;
  description?: string;
};

function formatPdfDate(date: Date | string | any) {
  if (!date) return "Not set";

  const dateObj = date instanceof Date
    ? date
    : typeof date === "string"
      ? new Date(date)
      : typeof date === "object" && date.seconds
        ? new Date(date.seconds * 1000)
        : typeof date === "object" && date.toDate
          ? date.toDate()
          : new Date(date);

  if (Number.isNaN(dateObj.getTime())) return "Not set";

  return dateObj.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateDuration(startDate: Date | string | any, endDate: Date | string | any) {
  const start = startDate instanceof Date
    ? startDate
    : typeof startDate === "object" && startDate?.seconds
      ? new Date(startDate.seconds * 1000)
      : typeof startDate === "object" && startDate?.toDate
        ? startDate.toDate()
        : new Date(startDate);

  const end = endDate instanceof Date
    ? endDate
    : typeof endDate === "object" && endDate?.seconds
      ? new Date(endDate.seconds * 1000)
      : typeof endDate === "object" && endDate?.toDate
        ? endDate.toDate()
        : new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

function safeText(value: unknown, fallback = "Not available") {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
}

function drawSectionTitle(pdf: jsPDF, title: string, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55);
  pdf.text(title, 14, y);
  pdf.setDrawColor(229, 231, 235);
  pdf.line(14, y + 2, 196, y + 2);
  return y + 9;
}

function ensureSpace(pdf: jsPDF, y: number, needed: number) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 14) {
    pdf.addPage();
    return 18;
  }
  return y;
}

function addWrappedText(pdf: jsPDF, text: string, x: number, y: number, width: number, lineHeight = 5) {
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addBulletList(pdf: jsPDF, items: string[], x: number, y: number, width: number) {
  let cursorY = y;
  items.forEach((item) => {
    cursorY = ensureSpace(pdf, cursorY, 12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    pdf.text("•", x, cursorY);
    cursorY = addWrappedText(pdf, item, x + 5, cursorY, width - 5, 5) + 1;
  });
  return cursorY;
}

export async function exportTripToPDF(trip: Trip, stops: PdfStop[] = []) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const startDate = formatPdfDate(trip.startDate);
  const endDate = formatPdfDate(trip.endDate);
  const duration = calculateDuration(trip.startDate, trip.endDate);
  const tripType = trip.tripType ? trip.tripType.charAt(0).toUpperCase() + trip.tripType.slice(1) : "Not set";
  const budget = typeof trip.budget === "number" ? `₹${trip.budget.toLocaleString()}` : `₹${Number(trip.budget || 0).toLocaleString()}`;
  const itineraryDays = Array.isArray(trip.aiRecommendation?.itinerary) ? trip.aiRecommendation.itinerary : [];
  const hotels = Array.isArray(trip.aiRecommendation?.hotels) ? trip.aiRecommendation.hotels : [];
  const restaurants = Array.isArray(trip.aiRecommendation?.restaurants) ? trip.aiRecommendation.restaurants : [];

  // Header band
  pdf.setFillColor(249, 115, 22);
  pdf.rect(0, 0, pageWidth, 34, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Planora", 14, 15);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("AI-Powered Travel Itinerary", 14, 24);

  pdf.setTextColor(31, 41, 55);
  let y = 46;

  y = drawSectionTitle(pdf, trip.title || "Trip Itinerary", y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  y = addWrappedText(pdf, `Destination: ${safeText(trip.destination)}`, 14, y, 180) + 1;
  y = addWrappedText(pdf, `Travel dates: ${startDate} to ${endDate} (${duration} day${duration === 1 ? "" : "s"})`, 14, y, 180) + 1;
  y = addWrappedText(pdf, `Travelers: ${trip.travelers || 1} | Trip type: ${tripType} | Budget: ${budget}`, 14, y, 180) + 4;

  y = drawSectionTitle(pdf, "Trip Summary", y);
  const summaryLines = [
    `Start location: ${safeText(trip.metadata?.travelInfo?.startLocation)}`,
    `Primary transport: ${safeText(trip.metadata?.travelInfo?.modeOfTravel)}`,
    `Trip theme: ${safeText(trip.metadata?.preferences?.tripThemes?.[0] || trip.aiRecommendation?.tripTheme)}`,
    `Hotel type: ${safeText(trip.metadata?.hotelPreferences?.hotelType)}`,
    `Room type: ${safeText(trip.metadata?.hotelPreferences?.roomType)}`,
  ];
  summaryLines.forEach((line) => {
    y = ensureSpace(pdf, y, 10);
    y = addWrappedText(pdf, line, 14, y, 180) + 1;
  });

  if (hotels.length > 0) {
    y = drawSectionTitle(pdf, "Recommended Hotels", y);
    hotels.slice(0, 4).forEach((hotel: any, index: number) => {
      y = ensureSpace(pdf, y, 24);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`${index + 1}. ${safeText(hotel.name, "Hotel")}`, 14, y);
      y += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      y = addWrappedText(pdf, `Location: ${safeText(hotel.location || hotel.address || trip.destination)}`, 18, y, 172) + 1;
      y = addWrappedText(pdf, `Rating: ${safeText(hotel.rating)} | Price per night: ${safeText(hotel.pricePerNight ? `₹${hotel.pricePerNight}` : undefined)}`, 18, y, 172) + 1;
      if (hotel.description) {
        y = addWrappedText(pdf, `Why it fits: ${hotel.description}`, 18, y, 172) + 1;
      }
    });
    y += 2;
  }

  if (itineraryDays.length > 0) {
    y = drawSectionTitle(pdf, "Day-by-Day Itinerary", y);
    itineraryDays.slice(0, 6).forEach((day: any) => {
      y = ensureSpace(pdf, y, 30);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`Day ${day.day || ""}${day.title || day.dayTitle ? ` - ${day.title || day.dayTitle}` : ""}`, 14, y);
      y += 6;

      const activities = Array.isArray(day.activities) ? day.activities : [];
      const activityLines = activities.slice(0, 5).map((activity: any) => {
        if (typeof activity === "string") return activity;
        const time = activity.startTime && activity.endTime ? `${activity.startTime} - ${activity.endTime}: ` : "";
        const location = activity.location ? ` (${activity.location})` : "";
        return `${time}${safeText(activity.title, "Activity")}${location}`;
      });

      if (activityLines.length > 0) {
        y = addBulletList(pdf, activityLines, 18, y, 172) + 2;
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        y = addWrappedText(pdf, "No activity details available for this day.", 18, y, 172) + 2;
      }
    });
  }

  if (restaurants.length > 0) {
    y = drawSectionTitle(pdf, "Recommended Restaurants", y);
    const restaurantLines = restaurants.slice(0, 4).map((restaurant: any) => {
      const location = restaurant.location ? ` - ${restaurant.location}` : "";
      return `${safeText(restaurant.title, "Restaurant")}${location}`;
    });
    y = addBulletList(pdf, restaurantLines, 14, y, 180) + 2;
  }

  if (stops.length > 0) {
    y = drawSectionTitle(pdf, "Map Stops", y);
    const stopLines = stops.slice(0, 6).map((stop) => {
      const location = stop.location ? ` - ${stop.location}` : "";
      return `${stop.label}${location}`;
    });
    y = addBulletList(pdf, stopLines, 14, y, 180) + 2;
  }

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Generated by Planora on ${new Date().toLocaleString()}`, 14, pageHeight - 10);

  const pageCount = (pdf as any).getNumberOfPages?.() || 1;
  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Page ${page} of ${pageCount}`, pageWidth - 28, pageHeight - 10);
  }

  const filename = `${(trip.title || trip.destination || "trip").replace(/[^a-zA-Z0-9]/g, "_")}_Itinerary.pdf`;
  pdf.save(filename);
}