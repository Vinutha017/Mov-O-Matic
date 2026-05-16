import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Sparkles, Send, X, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AITripAssistantMessage } from "@shared/schema";

type TripAssistantContext = {
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

interface AITripAssistantProps {
  tripContext: TripAssistantContext;
}

const starterPrompts = [
  "What should I prioritize on this trip?",
  "How can I make this itinerary fit my budget better?",
  "Suggest a backup plan for bad weather.",
];

export default function AITripAssistant({ tripContext }: AITripAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AITripAssistantMessage[]>([
    {
      role: "assistant",
      content: `I’m here to help with ${tripContext.destination || "this trip"}. Ask me about timing, budget, activities, hotels, or backup plans.`,
      createdAt: new Date().toISOString(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tripSummary = useMemo(() => {
    return {
      title: tripContext.title,
      destination: tripContext.destination,
      startLocation: tripContext.startLocation,
      startDate: tripContext.startDate,
      endDate: tripContext.endDate,
      budget: tripContext.budget,
      travelers: tripContext.travelers,
      tripType: tripContext.tripType,
      travelStyle: tripContext.travelStyle,
      interests: tripContext.interests,
      transportPreferences: tripContext.transportPreferences,
      accommodationAmenities: tripContext.accommodationAmenities,
      summary: tripContext.summary,
    };
  }, [tripContext]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  const askAssistant = async (prompt: string) => {
    if (!prompt.trim()) return;

    const nextMessages: AITripAssistantMessage[] = [
      ...messages,
      { role: "user", content: prompt, createdAt: new Date().toISOString() },
    ];
    setMessages(nextMessages);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/trip-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          tripContext: tripSummary,
          conversationHistory: nextMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get assistant response");
      }

      const data = await response.json();
      const replyText = data.reply || "I couldn't generate a response right now.";
      const suggestionText = Array.isArray(data.suggestions) && data.suggestions.length > 0
        ? `\n\nSuggestions:\n• ${data.suggestions.join("\n• ")}`
        : "";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${replyText}${suggestionText}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I couldn’t connect right now. Try asking again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <Card className="w-[360px] max-w-[calc(100vw-2rem)] border-orange-200 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4" />
                AI Trip Assistant
              </CardTitle>
              <p className="mt-1 text-xs text-orange-100">Ask about your trip plan, budget, and timing.</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto rounded-xl bg-gray-50 p-3">
              {messages.map((entry, index) => (
                <div
                  key={`${entry.role}-${index}`}
                  className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      entry.role === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-700 shadow-sm border border-gray-200"
                    }`}
                  >
                    {entry.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking through your itinerary...
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <Button key={prompt} type="button" variant="outline" size="sm" className="h-8 rounded-full text-xs" onClick={() => askAssistant(prompt)}>
                  {prompt}
                </Button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void askAssistant(message);
              }}
            >
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask anything about your trip..."
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !message.trim()} className="bg-orange-500 hover:bg-orange-600">
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Close Assistant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:from-orange-600 hover:to-red-600"
        >
          <div className="flex flex-col items-center justify-center">
            <MessageSquare className="h-5 w-5" />
            <Sparkles className="-mt-1 h-3 w-3" />
          </div>
        </Button>
      )}
    </div>
  );
}