import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-teal-600 to-purple-600">
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-hero text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Ready for your next
            <span className="block bg-gradient-to-r from-yellow-300 to-teal-300 bg-clip-text text-transparent">
              adventure?
            </span>
          </h2>
          
          <p className="font-body-large text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Your perfect trip is just 5 minutes away. Let's make it happen! ✈️
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-white to-gray-50 text-gray-900 hover:from-gray-50 hover:to-gray-100 border-2 border-white/50 font-semibold px-12 py-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                Start Planning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          {/* Enhanced social proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/70 text-sm font-medium">
            <div className="flex items-center">
              <span className="mr-2">✨</span>
              100% Free to use
            </div>
            <span className="text-white/40">•</span>
            <div className="flex items-center">
              <span className="mr-2">⚡</span>
              Results in seconds
            </div>
            <span className="text-white/40">•</span>
            <div className="flex items-center">
              <span className="mr-2">🎉</span>
              No signup required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
