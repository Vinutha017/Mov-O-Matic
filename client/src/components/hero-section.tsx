import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, Play, ArrowRight, MapPin, Sparkles as SparkleIcon } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white/95 px-6 py-16 text-center shadow-2xl shadow-rose-950/10 sm:px-10 lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(190,24,93,0.14),_transparent_24%),linear-gradient(135deg,_rgba(255,247,248,0.96),_rgba(253,242,248,0.92))]" />
      <div className="absolute -left-20 top-10 h-40 w-40 rounded-full bg-rose-300/30 blur-3xl animate-float" />
      <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-pink-300/25 blur-3xl animate-float-delayed" />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-4 py-2 text-sm text-rose-900 backdrop-blur">
          <MapPin className="h-4 w-4 text-rose-500" />
          AI trip planning for smarter journeys
        </div>

        <div className="space-y-4">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-rose-950 sm:text-5xl xl:text-6xl/none">
            Plan your next trip with clarity, speed, and AI precision.
          </h1>
          <p className="mx-auto max-w-3xl text-base text-rose-900/80 sm:text-lg lg:text-xl">
            Build personalized itineraries, discover the right stays, and keep your travel budget under control with a clean, intelligent planning experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/signup">
          <Button className="h-12 rounded-xl px-8 text-base bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-rose-500/20 hover:from-rose-700 hover:to-pink-600" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Start Planning Free
          </Button>
        </Link>
        <Button variant="outline" className="h-12 rounded-xl border-rose-200 bg-white/90 px-8 text-base text-rose-700 hover:bg-rose-50" size="lg">
          <Play className="mr-2 h-4 w-4" />
          Watch Demo
        </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-rose-900/80">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-3 py-1.5 backdrop-blur">
            <ArrowRight className="h-3.5 w-3.5 text-rose-500" />
            Smart itinerary generation
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-3 py-1.5 backdrop-blur">
            <SparkleIcon className="h-3.5 w-3.5 text-pink-400" />
            Budget-aware suggestions
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;