import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { MapPin, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interface for Indian city data structure
interface City {
  name: string;
  state: string;
}

// Props interface for the CityAutocomplete component
interface CityAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: City | null;
  onChange?: (city: City | null) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * CityAutocomplete Component
 * 
 * A React component that provides autocomplete functionality for Indian cities
 * using fuzzy search with Fuse.js. Features include:
 * - Fuzzy search across city names and states
 * - Dropdown with up to 8 suggestions
 * - Clean, professional styling with Tailwind CSS
 * - Keyboard navigation support
 * - Click-outside-to-close functionality
 */
const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  label = "City",
  placeholder = "Search for a city...",
  value,
  onChange,
  className = "",
  disabled = false
}) => {
  // State management
  const [cities, setCities] = useState<City[]>([]); // All available cities
  const [query, setQuery] = useState(''); // Current search query
  const [suggestions, setSuggestions] = useState<City[]>([]); // Filtered suggestions
  const [isOpen, setIsOpen] = useState(false); // Dropdown visibility
  const [selectedIndex, setSelectedIndex] = useState(-1); // Currently highlighted suggestion
  const [isLoading, setIsLoading] = useState(true); // Loading state for cities data
  
  // Refs for DOM manipulation
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<Fuse<City> | null>(null);

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: ['name', 'state'], // Search in both city name and state
    threshold: 0.3, // Fuzzy matching threshold (0 = exact match, 1 = match anything)
    distance: 100, // Maximum distance for a match
    includeScore: true, // Include match scores for ranking
    minMatchCharLength: 1, // Minimum characters to trigger search
  };

  /**
   * Load cities data from local JSON file
   */
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/indianCities.json');
        if (!response.ok) {
          throw new Error('Failed to load cities data');
        }
        const citiesData: City[] = await response.json();
        setCities(citiesData);
        
        // Initialize Fuse.js with cities data
        fuseRef.current = new Fuse(citiesData, fuseOptions);
        
        console.log(`Loaded ${citiesData.length} cities for autocomplete`);
      } catch (error) {
        console.error('Error loading cities:', error);
        // Fallback to empty array if loading fails
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, []);

  /**
   * Update query when value prop changes (controlled component behavior)
   */
  useEffect(() => {
    if (value) {
      setQuery(`${value.name}, ${value.state}`);
    } else {
      setQuery('');
    }
  }, [value]);

  /**
   * Handle search query changes and update suggestions
   */
  useEffect(() => {
    if (!query.trim() || !fuseRef.current) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Perform fuzzy search using Fuse.js
    const results = fuseRef.current.search(query.trim());
    
    // Extract cities from search results and limit to 8 suggestions
    const filteredCities = results
      .slice(0, 8)
      .map(result => result.item);
    
    setSuggestions(filteredCities);
    setIsOpen(filteredCities.length > 0);
    setSelectedIndex(-1); // Reset selection when suggestions change
  }, [query, cities]);

  /**
   * Handle input field changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear selection if user types (for controlled component behavior)
    if (onChange && newQuery !== (value ? `${value.name}, ${value.state}` : '')) {
      onChange(null);
    }
  };

  /**
   * Handle city selection from dropdown
   */
  const handleCitySelect = (city: City) => {
    setQuery(`${city.name}, ${city.state}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(city);
    }
    
    // Return focus to input
    inputRef.current?.focus();
  };

  /**
   * Handle keyboard navigation in dropdown
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleCitySelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  /**
   * Handle clicks outside the component to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handle input focus to show suggestions if query exists
   */
  const handleInputFocus = () => {
    if (query.trim() && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Label */}
      {label && (
        <Label 
          htmlFor="city-autocomplete" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </Label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Input Field */}
        <div className="relative">
          <Input
            ref={inputRef}
            id="city-autocomplete"
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Loading cities..." : placeholder}
            disabled={disabled || isLoading}
            className={`
              w-full pl-10 pr-10 py-2 
              border border-gray-300 rounded-md 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition-all duration-200
              ${isOpen ? 'rounded-b-none border-b-0' : ''}
            `}
            autoComplete="off"
          />
          
          {/* Location Icon */}
          <MapPin 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
          />
          
          {/* Dropdown Indicator */}
          <ChevronDown 
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400
              transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
            `}
          />
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="
              absolute top-full left-0 right-0 z-50
              bg-white border border-gray-300 border-t-0 rounded-b-md
              shadow-lg max-h-64 overflow-y-auto
            "
          >
            {suggestions.map((city, index) => (
              <div
                key={`${city.name}-${city.state}-${index}`}
                onClick={() => handleCitySelect(city)}
                className={`
                  px-4 py-3 cursor-pointer
                  flex items-center justify-between
                  hover:bg-blue-50 transition-colors duration-150
                  ${index === selectedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  ${index === suggestions.length - 1 ? 'rounded-b-md' : 'border-b border-gray-100'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {city.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {city.state}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {isOpen && query.trim() && suggestions.length === 0 && !isLoading && (
          <div
            ref={dropdownRef}
            className="
              absolute top-full left-0 right-0 z-50
              bg-white border border-gray-300 border-t-0 rounded-b-md
              shadow-lg px-4 py-3 text-gray-500 text-center
            "
          >
            No cities found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};

export default CityAutocomplete;