import { Link } from "wouter";
import Header from "@/components/header";
import TripWizardForm from "@/components/trip-wizard-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripWizard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="travel-container py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Perfect India Trip</h1>
          <p className="text-gray-600">Discover the incredible diversity of India - tell us your preferences and we'll create a personalized itinerary</p>
        </div>
        
        <TripWizardForm />
      </div>
    </div>
  );
}
