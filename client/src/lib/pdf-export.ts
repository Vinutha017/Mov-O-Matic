import jsPDF from "jspdf";
import type { Trip } from "@/lib/firebaseService";

type PdfStop = {
  label: string;
  location?: string;
  description?: string;
};

type PdfLine = {
  label: string;
  value: string;
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

function normalizePdfText(value: unknown, fallback = "Not available") {
  const text = safeText(value, fallback);
  return text
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s+/g, " ")
    .trim() || fallback;
}

function shortenText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function formatBulletText(value: unknown, fallback = "Not available") {
  return shortenText(normalizePdfText(value, fallback), 220);
}

function drawSectionTitle(pdf: jsPDF, title: string, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(17, 24, 39);
  pdf.text(title, 14, y);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(14, y + 2, 196, y + 2);
  return y + 8;
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

function measureWrappedHeight(pdf: jsPDF, text: string, width: number, lineHeight = 5) {
  const lines = pdf.splitTextToSize(text, width);
  return Math.max(lineHeight, lines.length * lineHeight);
}

function drawKeyValueCard(pdf: jsPDF, title: string, lines: PdfLine[], y: number, pageWidth: number) {
  const cardX = 14;
  const cardWidth = pageWidth - 28;
  const lineGap = 1.8;
  const labelWidth = 32;
  const valueWidth = cardWidth - 12 - labelWidth;

  const contentHeight = lines.reduce((total, line) => {
    const valueHeight = measureWrappedHeight(pdf, line.value, valueWidth, 4.5);
    return total + Math.max(5, valueHeight) + lineGap;
  }, 0);
  const totalHeight = 10 + contentHeight + 6;

  y = ensureSpace(pdf, y, totalHeight + 2);

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(cardX, y, cardWidth, totalHeight, 3, 3, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(title, cardX + 6, y + 7);

  let cursorY = y + 13;
  lines.forEach((line) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`${line.label}:`, cardX + 6, cursorY);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(30, 41, 59);
    const wrappedValue = pdf.splitTextToSize(line.value, valueWidth);
    pdf.text(wrappedValue, cardX + 6 + labelWidth, cursorY);
    cursorY += Math.max(5, wrappedValue.length * 4.5) + lineGap;
  });

  return y + totalHeight + 4;
}

function drawBulletCard(pdf: jsPDF, title: string, items: string[], y: number, pageWidth: number) {
  if (items.length === 0) return y;

  const cardX = 14;
  const cardWidth = pageWidth - 28;
  const innerWidth = cardWidth - 12;
  const bulletWidth = innerWidth - 6;

  const itemHeights = items.map((item) => measureWrappedHeight(pdf, item, bulletWidth, 4.5) + 2.5);
  const totalHeight = 10 + itemHeights.reduce((sum, height) => sum + height, 0) + 4;

  y = ensureSpace(pdf, y, totalHeight + 2);

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(cardX, y, cardWidth, totalHeight, 3, 3, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(title, cardX + 6, y + 7);

  let cursorY = y + 13;
  items.forEach((item) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(51, 65, 85);
    pdf.text("•", cardX + 6, cursorY);
    const lines = pdf.splitTextToSize(item, bulletWidth);
    pdf.text(lines, cardX + 11, cursorY);
    cursorY += Math.max(5, lines.length * 4.5) + 2.5;
  });

  return y + totalHeight + 4;
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
  const accentOrange = [249, 115, 22] as const;

  // Header band
  pdf.setFillColor(...accentOrange);
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
  pdf.setFontSize(10.5);
  y = addWrappedText(pdf, normalizePdfText(`Destination: ${trip.destination}`), 14, y, 180, 4.5) + 1;
  y = addWrappedText(pdf, normalizePdfText(`Travel dates: ${startDate} to ${endDate} (${duration} day${duration === 1 ? "" : "s"})`), 14, y, 180, 4.5) + 1;
  y += 3;

  y = drawKeyValueCard(pdf, "Trip Summary", [
    { label: "Start", value: normalizePdfText(trip.metadata?.travelInfo?.startLocation) },
    { label: "Transport", value: normalizePdfText(trip.metadata?.travelInfo?.modeOfTravel) },
    { label: "Theme", value: normalizePdfText(trip.metadata?.preferences?.tripThemes?.[0] || trip.aiRecommendation?.tripTheme) },
    { label: "Hotel", value: normalizePdfText(trip.metadata?.hotelPreferences?.hotelType) },
    { label: "Room", value: normalizePdfText(trip.metadata?.hotelPreferences?.roomType) },
  ], y, pageWidth);

  if (hotels.length > 0) {
    y = drawSectionTitle(pdf, "Recommended Hotels", y);
    hotels.slice(0, 4).forEach((hotel: any, index: number) => {
      y = ensureSpace(pdf, y, 30);
      const hotelTitle = normalizePdfText(hotel.name, "Hotel");
      const hotelLocation = normalizePdfText(hotel.location || hotel.address || trip.destination);
      const hotelRating = normalizePdfText(hotel.rating, "Not available");
      const hotelPrice = hotel.pricePerNight ? `₹${hotel.pricePerNight}` : "Not available";
      const hotelDescription = hotel.description ? shortenText(normalizePdfText(hotel.description), 210) : "";

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${index + 1}. ${hotelTitle}`, 14, y);
      y += 5.5;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(51, 65, 85);
      y = addWrappedText(pdf, `Location: ${hotelLocation}`, 18, y, 172, 4.5) + 0.5;
      y = addWrappedText(pdf, `Rating: ${hotelRating} | Price per night: ${hotelPrice}`, 18, y, 172, 4.5) + 0.5;
      if (hotelDescription) {
        y = addWrappedText(pdf, `Why it fits: ${hotelDescription}`, 18, y, 172, 4.5) + 0.5;
      }
    });
    y += 2;
  }

  if (itineraryDays.length > 0) {
    y = drawSectionTitle(pdf, "Day-by-Day Itinerary", y);
    itineraryDays.slice(0, 6).forEach((day: any) => {
      y = ensureSpace(pdf, y, 30);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.8);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`Day ${day.day || ""}${day.title || day.dayTitle ? ` - ${normalizePdfText(day.title || day.dayTitle)}` : ""}`, 14, y);
      y += 5.5;

      const activities = Array.isArray(day.activities) ? day.activities : [];
      const activityLines = activities.slice(0, 5).map((activity: any) => {
        if (typeof activity === "string") return activity;
        const time = activity.startTime && activity.endTime ? `${activity.startTime} - ${activity.endTime}: ` : "";
        const location = activity.location ? ` (${normalizePdfText(activity.location)})` : "";
        const title = normalizePdfText(activity.title, "Activity");
        const note = activity.description ? ` - ${shortenText(normalizePdfText(activity.description), 100)}` : "";
        return `${time}${title}${location}${note}`;
      });

      if (activityLines.length > 0) {
        y = drawBulletCard(pdf, `Day ${day.day || ""} Activities`, activityLines.map((item) => formatBulletText(item)), y, pageWidth);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.5);
        y = addWrappedText(pdf, "No activity details available for this day.", 18, y, 172, 4.5) + 2;
      }
    });
  }

  if (restaurants.length > 0) {
    y = drawSectionTitle(pdf, "Recommended Restaurants", y);
    const restaurantLines = restaurants.slice(0, 4).map((restaurant: any) => {
      const location = restaurant.location ? ` - ${normalizePdfText(restaurant.location)}` : "";
      const description = restaurant.description ? ` - ${shortenText(normalizePdfText(restaurant.description), 90)}` : "";
      return `${normalizePdfText(restaurant.title, "Restaurant")}${location}${description}`;
    });
    y = drawBulletCard(pdf, "Top Picks", restaurantLines.map((item) => formatBulletText(item)), y, pageWidth);
  }

  if (stops.length > 0) {
    y = drawSectionTitle(pdf, "Map Stops", y);
    const stopLines = stops.slice(0, 6).map((stop) => {
      const location = stop.location ? ` - ${normalizePdfText(stop.location)}` : "";
      const description = stop.description ? ` - ${shortenText(normalizePdfText(stop.description), 90)}` : "";
      return `${normalizePdfText(stop.label)}${location}${description}`;
    });
    y = drawBulletCard(pdf, "Map Stops", stopLines.map((item) => formatBulletText(item)), y, pageWidth);
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
    if (page === 1) {
      pdf.setDrawColor(226, 232, 240);
      pdf.line(14, 37, pageWidth - 14, 37);
    }
  }

  const filename = `${(trip.title || trip.destination || "trip").replace(/[^a-zA-Z0-9]/g, "_")}_Itinerary.pdf`;
  pdf.save(filename);
}