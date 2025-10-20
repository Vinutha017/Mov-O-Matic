import { Sparkles, Brain, Settings, MessageSquare, MapPin, Calendar, DollarSign, Users, Share2, Clock, Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface ItineraryItem {
  day: string;
  activity: string;
  time: string;
}

interface ExpenseItem {
  item: string;
  amount: number;
}

interface BudgetInfo {
  total: number;
  spent: number;
  remaining: number;
}

interface PreviewData {
  type: "input" | "itinerary" | "tracking";
  title: string;
  features: string[];
  content?: string;
  itineraryItems?: ItineraryItem[];
  hotel?: string;
  budget?: BudgetInfo;
  expenses?: ExpenseItem[];
}

const steps = [
  {
    number: 1,
    title: "Fill Our Smart Form",
    description: "Complete our comprehensive form with your India travel preferences - destination, budget, travel dates, activities, and accommodation preferences.",
    icon: Sparkles,
    color: "from-blue-500 to-purple-600",
    preview: {
      type: "input" as const,
      title: "India Trip Planning Form",
      content: "✅ Destination: Kerala, India\n✅ Budget: ₹25,000 per person\n✅ Duration: 7 days\n✅ Interests: Backwaters, Ayurveda, Local cuisine\n✅ Hotel: Heritage properties preferred",
      features: ["Step-by-step form", "India-specific options", "Comprehensive preferences"]
    }
  },
  {
    number: 2,
    title: "Get Your India Itinerary",
    description: "Based on your form inputs, we create a detailed India itinerary with authentic experiences, local insights, and perfect accommodation matches.",
    icon: Brain,
    color: "from-purple-500 to-pink-600",
    preview: {
      type: "itinerary" as const,
      title: "Your Kerala Backwaters Journey",
      itineraryItems: [
        { day: "Day 1", activity: "Arrival in Kochi - Fort Kochi Heritage Walk", time: "3:00 PM" },
        { day: "Day 2", activity: "Houseboat in Alleppey Backwaters", time: "10:00 AM" },
        { day: "Day 3", activity: "Munnar Hill Station & Tea Gardens", time: "8:00 AM" }
      ],
      hotel: "Heritage Houseboat & Tea Estate Resort - Authentic Kerala experience!",
      features: ["India-specific itinerary", "Local experiences", "Heritage accommodations"]
    }
  },
  {
    number: 3,
    title: "Track Your India Trip Budget",
    description: "Monitor your India travel budget in Indian Rupees, track local expenses, and share your amazing itinerary with family and friends.",
    icon: Settings,
    color: "from-green-500 to-teal-600",
    preview: {
      type: "tracking" as const,
      title: "Budget Tracking in ₹",
      budget: { total: 25000, spent: 15000, remaining: 10000 },
      expenses: [
        { item: "Heritage Hotels (6 nights)", amount: 8000 },
        { item: "Local Food & Restaurants", amount: 3500 },
        { item: "Activities & Sightseeing", amount: 3500 }
      ],
      features: ["Indian Rupee tracking", "Local expense categories", "Share India adventures"]
    }
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="travel-container">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl mb-4 text-gray-900">
            How it works (3 simple steps)
          </h2>
          <p className="font-body text-lg max-w-2xl mx-auto text-gray-600">
            From form to itinerary - planning your India trip has never been easier
          </p>
        </div>

        {/* Side by Side Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Steps Side */}
            <div className="space-y-8">
              <h3 className="font-heading text-2xl mb-8 text-center lg:text-left">Simple Steps</h3>
              {steps.map((step, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`px-3 py-1 bg-gradient-to-r ${step.color} text-white rounded-full text-sm font-button`}>
                      Step {step.number}
                    </div>
                  </div>
                  
                  <h4 className="font-heading text-xl mb-3 text-gray-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="font-body text-gray-600 dark:text-gray-300 mb-4">
                    {step.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {step.preview.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 bg-gradient-to-r ${step.color} rounded-full`}></div>
                        <span className="font-body text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Live Preview Side */}
            <div className="sticky top-8">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header with Animation */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white">🇮🇳</span>
                      </div>
                      <h4 className="font-heading text-xl">Live India Trip Preview</h4>
                    </div>
                    <p className="font-body text-white/90 text-sm">Watch your incredible India journey come to life</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Step 1: Form Input */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <span className="font-button text-blue-800 text-sm">Fill Smart Form</span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-4 h-4 text-blue-600" />
                        <span className="font-body text-blue-800 text-xs font-medium">Comprehensive Trip Form</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Destination:</span>
                          <span className="font-semibold text-blue-600">Rajasthan, India</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold text-purple-600">8 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-semibold text-green-600">₹80,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Interests:</span>
                          <span className="font-semibold text-orange-600">Heritage, Food, Desert</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: AI Processing with Animation */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <span className="font-button text-purple-800 text-sm">AI Creates Magic</span>
                      <div className="ml-auto flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                        <span className="font-body text-purple-800 text-xs font-medium">Generated in 3.2 seconds</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-heading text-sm text-gray-900 dark:text-white">Jaipur (3 days)</div>
                            <div className="font-body text-xs text-gray-600 dark:text-gray-300">Pink City, Amber Fort, Palaces</div>
                          </div>
                          <div className="text-xs text-blue-600 font-medium">₹28,000</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <div className="flex-1">
                            <div className="font-heading text-sm text-gray-900 dark:text-white">Udaipur (2 days)</div>
                            <div className="font-body text-xs text-gray-600 dark:text-gray-300">City of Lakes, Heritage Hotels</div>
                          </div>
                          <div className="text-xs text-purple-600 font-medium">₹22,000</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <div className="flex-1">
                            <div className="font-heading text-sm text-gray-900 dark:text-white">Jaisalmer (3 days)</div>
                            <div className="font-body text-xs text-gray-600 dark:text-gray-300">Golden City, Desert Safari</div>
                          </div>
                          <div className="text-xs text-green-600 font-medium">₹25,000</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Complete Package */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <span className="font-button text-green-800 text-sm">You Get Everything</span>
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Budget Status */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-heading text-sm text-gray-900 dark:text-white">Smart Budget Planning</span>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-button">
                          ₹5,000 Under Budget!
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">₹80,000</div>
                          <div className="text-xs font-body text-gray-600 dark:text-gray-300">Budget</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600">₹75,000</div>
                          <div className="text-xs font-body text-gray-600 dark:text-gray-300">Total Cost</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">₹5,000</div>
                          <div className="text-xs font-body text-gray-600 dark:text-gray-300">Saved</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">12</div>
                          <div className="text-xs font-body text-gray-600 dark:text-gray-300">Experiences</div>
                        </div>
                      </div>
                    </div>

                    {/* India-Specific Features */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span className="font-body text-gray-700">Local guide recommendations</span>
                        <div className="ml-auto text-green-600">✓</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        <span className="font-body text-gray-700">Festival & weather alerts</span>
                        <div className="ml-auto text-green-600">✓</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Star className="w-3 h-3 text-orange-600" />
                        <span className="font-body text-gray-700">Heritage hotel suggestions</span>
                        <div className="ml-auto text-green-600">✓</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 text-center text-red-600">🍛</span>
                        <span className="font-body text-gray-700">Local cuisine recommendations</span>
                        <div className="ml-auto text-green-600">✓</div>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span className="font-button text-sm">Ready in 3 minutes</span>
                        <Sparkles className="w-4 h-4 animate-spin" />
                      </div>
                      <p className="font-body text-white/90 text-xs">
                        This could be your next adventure!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto transform hover:-translate-y-2 transition-all duration-500">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Experience This Magic?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Join thousands of travelers who trust Move-O-Matic for their perfect trips
            </p>
            <Link href="/signup">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group text-lg">
                <Sparkles className="w-6 h-6 mr-3 inline group-hover:rotate-12 transition-transform" />
                Start Planning Your Dream Trip
                <ArrowRight className="w-6 h-6 ml-3 inline group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-gray-500 text-sm mt-4">
              ✨ Free to use • No signup required • Instant results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}