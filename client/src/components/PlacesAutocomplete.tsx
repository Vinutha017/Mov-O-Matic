import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  label = 'Place',
  placeholder = 'Search for a place in India...',
  value = '',
  onChange,
  onSelect,
  className = ''
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState<string>(value || '');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // debounce search that queries our server-side proxy
  const doSearchRef = useRef<any>(null);

  useEffect(() => {
    doSearchRef.current = localDebounce(async (input: string) => {
      if (!input) {
        setPredictions([]);
        setIsOpen(false);
        return;
      }

      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
        if (!res.ok) {
          setPredictions([]);
          setIsOpen(false);
          return;
        }
        const json = await res.json();
        const preds = json.predictions || [];
        setPredictions(preds.map((p: any) => ({ description: p.description, place_id: p.place_id })));
        setIsOpen(preds.length > 0);
      } catch (err) {
        console.error('Places proxy error', err);
        setPredictions([]);
        setIsOpen(false);
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

  const handleSelect = (p: Prediction) => {
    setQuery(p.description);
    setIsOpen(false);
    setPredictions([]);
    onSelect?.(p);
    onChange?.(p.description);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {label && <Label className="mb-2">{label}</Label>}
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange?.(e.target.value); }}
        onFocus={() => { if (predictions.length) setIsOpen(true); }}
        autoComplete="off"
      />

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 bg-white border rounded-b-md shadow-lg max-h-64 overflow-y-auto mt-1">
          {predictions.map((p, i) => (
            <div key={p.place_id || i} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(p)}>
              {p.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
