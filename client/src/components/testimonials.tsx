import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "Mumbai, India",
    rating: 5.0,
    content: "MOV O MATIC planned our entire Kerala trip in under 10 minutes! The AI recommendations were spot-on, and the budget tracking saved us from overspending. Best travel app ever!",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    trip: "Kerala Backwaters"
  },
  {
    id: 2,
    name: "Raj P.",
    location: "Bangalore, India",
    rating: 5.0,
    content: "The drag-and-drop itinerary builder is genius! We changed our plans 5 times and the app automatically optimized our routes. The weather alerts saved our beach day too.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    trip: "Goa Beach Holiday"
  },
  {
    id: 3,
    name: "Priya S.",
    location: "Delhi, India",
    rating: 5.0,
    content: "As a family of 5, planning trips was always stressful. MOV O MATIC considered everyone's interests and created an itinerary that made everyone happy. The kids loved the interactive features!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    trip: "Family Trip to Rajasthan"
  }
];

export default function Testimonials() {
  return (
    <section className="travel-section bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="travel-container">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="travel-heading">What Travelers Say</h2>
          <p className="travel-subheading">Join thousands of happy travelers who trust MOV O MATIC</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="group bg-white rounded-2xl p-8 shadow-lg travel-card-hover border border-gray-100 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-primary" />
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="ml-3 text-gray-600 font-semibold">{testimonial.rating}</span>
              </div>
              
              <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">"{testimonial.content}"</p>
              
              {/* Trip info */}
              <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100">
                <span className="text-sm font-medium text-blue-800">Trip: {testimonial.trip}</span>
              </div>
              
              <div className="flex items-center">
                <div className="relative">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-fade-in">
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-gray-600">Happy Travelers</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-secondary mb-2">500+</div>
            <div className="text-gray-600">Destinations</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-accent mb-2">4.9★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">10min</div>
            <div className="text-gray-600">Avg. Planning Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}