"use client";

import { useState, useRef } from "react";
import locations from "./travel-locations.json";
import { useLocationSearch, useClickOutside } from "./_hooks";
import { Button } from "@/components/ui/button";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationAutocomplete({
  value,
  onChange,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for business logic
  const { filteredLocations, apiResults, loading } = useLocationSearch({
    value,
    locations,
  });

  useClickOutside([dropdownRef, inputRef], () => setIsOpen(false));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectLocation = (city: string, country: string) => {
    onChange(`${city}, ${country}`);
    setIsOpen(false);
  };

  const allResults = [...filteredLocations.slice(0, 10), ...apiResults];
  const hasResults = allResults.length > 0;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="City or country... e.g., Paris, France, Italy, Japan"
        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />

      {isOpen && hasResults && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {/* Local results */}
          {filteredLocations.slice(0, 10).map((location, idx) => (
            <Button
              key={`local-${idx}`}
              type="button"
              variant="ghost"
              onClick={() =>
                handleSelectLocation(location.city, location.country)
              }
              className="w-full h-auto px-3 py-2 text-left justify-between font-normal"
            >
              <span className="text-gray-900 dark:text-white">
                {location.city}, {location.country}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {location.region}
              </span>
            </Button>
          ))}

          {/* Separator if have both local and API results */}
          {filteredLocations.length > 0 && apiResults.length > 0 && (
            <div className="border-t dark:border-gray-700 my-1" />
          )}

          {/* API results */}
          {apiResults.map((location, idx) => (
            <Button
              key={`api-${idx}`}
              type="button"
              variant="ghost"
              onClick={() =>
                handleSelectLocation(location.city, location.country)
              }
              className="w-full h-auto px-3 py-2 text-left justify-between font-normal"
            >
              <span className="text-gray-900 dark:text-white">
                {location.city}, {location.country}
              </span>
              <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1">
                <span>🌍</span>
                {location.region}
              </span>
            </Button>
          ))}

          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              🔍 Searching worldwide...
            </div>
          )}

          {filteredLocations.length > 10 && (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t dark:border-gray-700">
              +{filteredLocations.length - 10} more local results
            </div>
          )}
        </div>
      )}

      {isOpen && !hasResults && !loading && value && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-3"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No locations found. You can still enter custom location.
          </p>
        </div>
      )}

      {isOpen && loading && allResults.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-3"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="animate-spin">🔄</span>
            Searching...
          </p>
        </div>
      )}
    </div>
  );
}
