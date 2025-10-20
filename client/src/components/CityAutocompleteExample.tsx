import React, { useState } from 'react';
import CityAutocomplete from '@/components/CityAutocomplete';

/**
 * Example usage of the CityAutocomplete component
 * 
 * This demonstrates how to use the component for both
 * start city and destination city inputs in a travel booking form.
 */
const CityAutocompleteExample: React.FC = () => {
  // State to store selected cities
  const [fromCity, setFromCity] = useState<{name: string, state: string} | null>(null);
  const [toCity, setToCity] = useState<{name: string, state: string} | null>(null);

  const handleBooking = () => {
    if (fromCity && toCity) {
      console.log('Booking trip from:', fromCity, 'to:', toCity);
      // Handle booking logic here
    } else {
      alert('Please select both departure and destination cities');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Your Trip</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* From City */}
        <CityAutocomplete
          label="From City"
          placeholder="Search departure city..."
          value={fromCity}
          onChange={setFromCity}
        />
        
        {/* To City */}
        <CityAutocomplete
          label="To City"
          placeholder="Search destination..."
          value={toCity}
          onChange={setToCity}
        />
      </div>

      {/* Selected Cities Display */}
      {(fromCity || toCity) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold text-gray-700 mb-2">Selected Cities:</h3>
          {fromCity && (
            <p className="text-sm text-gray-600">
              <strong>From:</strong> {fromCity.name}, {fromCity.state}
            </p>
          )}
          {toCity && (
            <p className="text-sm text-gray-600">
              <strong>To:</strong> {toCity.name}, {toCity.state}
            </p>
          )}
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!fromCity || !toCity}
        className="
          w-full py-3 px-4 
          bg-blue-600 hover:bg-blue-700 
          disabled:bg-gray-300 disabled:cursor-not-allowed
          text-white font-medium rounded-md 
          transition-colors duration-200
        "
      >
        Book Trip
      </button>
    </div>
  );
};

export default CityAutocompleteExample;