import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Sparkles, Play, Wand2 } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center py-12">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
        Your Ultimate Trip Planning Companion
      </h1>
      <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
        Create personalized movie watchlists, get recommendations, and track your watching progress.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/plan">
          <Button className="h-11 px-8" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Start Planning Free
          </Button>
        </Link>
        <Button variant="outline" className="h-11 px-8" size="lg">
          <Play className="mr-2 h-4 w-4" />
          Watch Demo
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;