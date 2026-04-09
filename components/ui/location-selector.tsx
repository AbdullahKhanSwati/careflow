'use client';

import { useState, useEffect } from 'react';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationSelectorProps {
  country: string;
  state: string;
  city: string;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  disabled?: boolean;
  error?: {
    country?: string;
    state?: string;
    city?: string;
  };
}

export function LocationSelector({
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false,
  error,
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  // Load countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    // Sort with US at top, then alphabetically
    const sortedCountries = allCountries.sort((a, b) => {
      if (a.isoCode === 'US') return -1;
      if (b.isoCode === 'US') return 1;
      return a.name.localeCompare(b.name);
    });
    setCountries(sortedCountries);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (country) {
      const countryStates = State.getStatesOfCountry(country);
      setStates(countryStates);
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [country]);

  // Load cities when state changes
  useEffect(() => {
    if (country && state) {
      const stateCities = City.getCitiesOfState(country, state);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [country, state]);

  const handleCountryChange = (value: string) => {
    onCountryChange(value);
    onStateChange('');
    onCityChange('');
  };

  const handleStateChange = (value: string) => {
    onStateChange(value);
    onCityChange('');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="country">
          Country <span className="text-destructive">*</span>
        </Label>
        <Select
          value={country || ''}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger id="country" className={error?.country ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {countries.map((c) => (
              <SelectItem key={c.isoCode} value={c.isoCode}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.country && (
          <p className="text-xs text-destructive">{error.country}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="state">
          State <span className="text-destructive">*</span>
        </Label>
        <Select
          value={state || ''}
          onValueChange={handleStateChange}
          disabled={disabled || !country}
        >
          <SelectTrigger id="state" className={error?.state ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {states.map((s) => (
              <SelectItem key={s.isoCode} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.state && (
          <p className="text-xs text-destructive">{error.state}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">
          City <span className="text-destructive">*</span>
        </Label>
        <Select
          value={city || ''}
          onValueChange={onCityChange}
          disabled={disabled || !state}
        >
          <SelectTrigger id="city" className={error?.city ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {cities.map((c) => (
              <SelectItem key={`${c.name}-${c.latitude}`} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error?.city && (
          <p className="text-xs text-destructive">{error.city}</p>
        )}
      </div>
    </div>
  );
}
