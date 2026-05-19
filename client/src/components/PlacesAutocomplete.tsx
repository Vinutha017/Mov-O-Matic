import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiUrl } from '@/lib/queryClient';

interface Prediction {
  description: string;
  place_id: string;
}

interface PlacesAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void; // when input changes
  onSelect?: (prediction: Prediction) => void; // when user selects suggestion
  className?: string;
  disabled?: boolean;
}

// Minimal debounce implementation to avoid extra dependency on lodash
function localDebounce(fn: (...args: any[]) => void, wait = 250) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  (debounced as any).cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}

export default function PlacesAutocomplete({
  label,
  placeholder = 'Search for a place in India...',
  value = '',
  onChange,
  onSelect,
  className = '',
  disabled = false,
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState<string>(value || '');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  // debounce search that queries our server-side proxy
  const doSearchRef = useRef<any>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    doSearchRef.current = localDebounce(async (input: string) => {
      if (!input) {
        setPredictions([]);
        setIsOpen(false);
        return;
      }

      try {
        setIsSearching(true);
        const res = await fetch(apiUrl(`/api/places/autocomplete?input=${encodeURIComponent(input)}`));
        if (!res.ok) {
          setPredictions([]);
          setIsOpen(false);
          return;
        }
        const json = await res.json();
        const preds = json.predictions || [];
        setPredictions(preds.map((p: any) => ({ description: p.description, place_id: p.place_id })));
        setIsOpen(preds.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Places proxy error', err);
        setPredictions([]);
        setIsOpen(false);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      doSearchRef.current?.cancel?.();
    };
  }, []);

  useEffect(() => {
    doSearchRef.current(query);
  }, [query]);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (p: Prediction) => {
    setQuery(p.description);
    setIsOpen(false);
    setPredictions([]);
    setSelectedIndex(-1);
    onSelect?.(p);
    onChange?.(p.description);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || predictions.length === 0) {
      if (event.key === 'Escape') setIsOpen(false);
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((current) => Math.min(current + 1, predictions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((current) => Math.max(current - 1, -1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      {label && <Label className="mb-2 block text-sm font-medium text-gray-700">{label}</Label>}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            const nextValue = e.target.value;
            setQuery(nextValue);
            onChange?.(nextValue);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (predictions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          disabled={disabled}
          className="pl-10 pr-10"
        />
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-b-md border border-t-0 bg-white shadow-lg">
          {predictions.length > 0 ? (
            predictions.map((p, index) => (
              <button
                type="button"
                key={p.place_id || index}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${index === selectedIndex ? 'bg-orange-50' : ''}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(p);
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span className="text-sm text-gray-700">{p.description}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">No places found. Try a different city or landmark.</div>
          )}
        </div>
      )}
    </div>
  );
}
