import { Button } from "@/components/ui/button";
import { Share, Download, Plus, Map, Sparkles, CornerLeftUp, TrendingUp, CloudRain } from "lucide-react";

const demoFeatures = [
  {
    icon: Sparkles,
    title: "AI-Powered Suggestions",
    description: "Get personalized recommendations based on your preferences, budget, and travel style",
    color: "primary"
  },
  {
    icon: CornerLeftUp,
    title: "Drag & Drop Planning",
    description: "Easily rearrange your itinerary with automatic route optimization and time adjustments",
    color: "secondary"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Budget Tracking",
    description: "Monitor your expenses with visual charts and get alerts before you overspend",
    color: "accent"
  },
  {
    icon: CloudRain,
    title: "Live Updates",
    description: "Stay informed with weather alerts and traffic updates that automatically adjust your plans",
    color: "purple"
  }
];

export default function InteractiveDemo() {
  return (
    <section className="travel-section bg-white">
      <div className="travel-container">
        <div className="text-center mb-16">
          <h2 className="travel-heading">See MOV O MATIC in Action</h2>
          <p className="travel-subheading">Experience the power of AI-driven travel planning</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Interface */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* App Header */}
              <div className="bg-gray-800 p-4 flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-gray-700 rounded-lg px-4 py-1 text-gray-300 text-sm flex-1 text-center">
                  app.movomatic.com/trip/jaipur-5days
                </div>
              </div>
              
              {/* App Content */}
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">5-Day Jaipur Cultural Experience</h3>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-primary text-white">
                      <Share className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline" className="text-gray-700">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
                
                {/* Budget Overview */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">₹23,500</div>
                    <div className="text-sm text-green-700">Total Budget</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₹8,200</div>
                    <div className="text-sm text-blue-700">Spent</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">₹15,300</div>
                    <div className="text-sm text-orange-700">Remaining</div>
                  </div>
                </div>
                
                {/* Day-by-Day Itinerary Preview */}
                <div className="space-y-4">
                  {[
                    { number: 1, title: "Amber Fort & Palace", time: "09:00 - 12:00", cost: "₹2,500", color: "primary" },
                    { number: 2, title: "Traditional Rajasthani Lunch", time: "12:30 - 14:00", cost: "₹800", color: "secondary" },
                    { number: 3, title: "City Palace Complex", time: "15:00 - 18:00", cost: "₹1,200", color: "accent" }
                  ].map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-${item.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                            {item.number}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.time} • {item.cost}</p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <Button className="flex-1 travel-gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                  <Button variant="outline" className="px-6">
                    <Map className="w-4 h-4 mr-2" />
                    View Map
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Demo Features */}
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Powerful Features at Your Fingertips</h3>
            
            <div className="space-y-6">
              {demoFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-10 h-10 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`text-${feature.color}-600`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="mt-8 travel-button">
              <Sparkles className="w-5 h-5 mr-2" />
              Try Interactive Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}