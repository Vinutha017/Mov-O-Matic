import { Brain, Calendar, Wallet, Hotel, Users, Sparkles } from "lucide-react";

const coreFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Itinerary Builder",
    description: "Let artificial intelligence create personalized travel plans based on your preferences, budget, and interests.",
    gradient: "from-blue-600 to-purple-600",
    highlights: ["Smart destination suggestions", "Personalized activities", "Budget-optimized plans"]
  },
  {
    icon: Wallet,
    title: "Smart Budget Tracking",
    description: "Keep your travel expenses organized with intelligent budget tracking and real-time spending insights.",
    gradient: "from-green-600 to-teal-600",
    highlights: ["Real-time expense tracking", "Currency conversion", "Budget alerts & insights"]
  },
  {
    icon: Hotel,
    title: "Hotel Recommendations",
    description: "Discover the perfect accommodations with AI-powered hotel suggestions tailored to your travel style.",
    gradient: "from-orange-600 to-red-600",
    highlights: ["Personalized hotel matches", "Price comparison", "Guest review analysis"]
  },
  {
    icon: Users,
    title: "Share & Collaborate",
    description: "Plan together with friends and family. Share itineraries, collaborate in real-time, and export your plans.",
    gradient: "from-pink-600 to-rose-600",
    highlights: ["Real-time collaboration", "Trip sharing", "PDF export & offline access"]
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="travel-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-teal-50 text-blue-800 rounded-full text-sm font-button mb-6 border border-blue-200 shadow-lg backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Your Complete Travel Toolkit
          </div>
          <h2 className="font-heading text-4xl md:text-5xl mb-6 leading-tight text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Powerful tools for seamless travel planning
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {coreFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative">
                {/* Enhanced Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-2xl mb-5 text-gray-900 group-hover:text-blue-700">
                  {feature.title}
                </h3>
                <p className="font-body text-lg mb-8 text-gray-600">
                  {feature.description}
                </p>

                {/* Enhanced Highlights */}
                <div className="space-y-4">
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-gray-700">
                      <div className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-sm`}>
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="font-body font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Decorative element */}
                <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity duration-500`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}