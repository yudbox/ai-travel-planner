import { useState, useRef, useEffect } from "react";

interface LocationItem {
  city: string;
  country: string;
  region: string;
}

interface Country {
  name: {
    common: string;
    official: string;
  };
  capital?: string[];
  region: string;
  subregion?: string;
}

interface UseLocationSearchParams {
  value: string;
  locations: LocationItem[];
}

interface UseLocationSearchResult {
  filteredLocations: LocationItem[];
  apiResults: LocationItem[];
  loading: boolean;
}

export function useLocationSearch({
  value,
  locations,
}: UseLocationSearchParams): UseLocationSearchResult {
  const [filteredLocations, setFilteredLocations] =
    useState<LocationItem[]>(locations);
  const [apiResults, setApiResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Filter local locations
    if (value) {
      const filtered = locations.filter(
        (loc) =>
          loc.city.toLowerCase().includes(value.toLowerCase()) ||
          loc.country.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredLocations(filtered);

      // If local results are limited, search API
      if (filtered.length < 3 && value.length >= 3) {
        // Extract search term - if comma exists, use part after comma (likely country)
        // Otherwise use the whole value
        const searchTerm = value.includes(",")
          ? value.split(",").pop()?.trim() || value
          : value;

        // Don't search API if we already have exact match from local or if it's too short
        const hasExactMatch = filtered.some(
          (loc) =>
            loc.city.toLowerCase() === value.toLowerCase() ||
            `${loc.city}, ${loc.country}`.toLowerCase() === value.toLowerCase(),
        );

        if (!hasExactMatch && searchTerm.length >= 3) {
          debounceTimer.current = setTimeout(() => {
            searchCountriesAPI(searchTerm);
          }, 500); // Debounce 500ms
        } else {
          setApiResults([]);
          setLoading(false);
        }
      } else {
        setApiResults([]);
        setLoading(false);
      }
    } else {
      setFilteredLocations(locations);
      setApiResults([]);
      setLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const searchCountriesAPI = async (query: string) => {
    setLoading(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_RESTCOUNTRIES_API_URL ||
        "https://restcountries.com/v3.1";
      const fullUrl = `${apiUrl}/name/${encodeURIComponent(query)}?fields=name,capital,region,subregion`;

      console.log("🔍 Search query:", query);
      console.log("🌍 Restcountries API Request:", fullUrl);

      const response = await fetch(fullUrl);

      console.log(
        "📡 API Response status:",
        response.status,
        response.statusText,
      );

      if (response.ok) {
        const countries: Country[] = await response.json();

        console.log("🗺️ Raw API Response (countries):", countries);
        console.log("📊 Number of countries found:", countries.length);

        const results = countries
          .filter((country) => country.capital && country.capital.length > 0)
          .map((country) => ({
            city: country.capital![0],
            country: country.name.common,
            region: country.subregion || country.region,
          }))
          .slice(0, 5); // Limit to 5 API results

        console.log("✅ Processed results:", results);

        setApiResults(results);
      } else {
        console.log(
          "❌ API Response not OK - country not found or invalid query",
        );
        setApiResults([]);
      }
    } catch (error) {
      console.error("❌ API search error:", error);
      setApiResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { filteredLocations, apiResults, loading };
}
