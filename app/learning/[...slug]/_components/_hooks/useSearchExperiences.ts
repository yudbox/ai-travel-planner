import { useState, useCallback } from "react";
import { Category, Budget, Season, Companions } from "../_types";

interface Experience {
  id: string;
  description: string;
  category: Category;
  location: string;
  emotions: string[];
  season: Season;
  budget: Budget;
  companions: Companions;
  score?: number;
}

interface SearchFilters {
  query: string;
  categories: Category[];
  maxBudget: Budget;
}

export function useSearchExperiences() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    categories: [
      Category.Nature,
      Category.Food,
      Category.Culture,
      Category.Adventure,
      Category.Relaxation,
    ],
    maxBudget: Budget.High,
  });

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Experience[]>([]);

  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(field: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const searchExperiences = useCallback(async () => {
    if (!filters.query) {
      alert("Please enter a search query");
      return;
    }

    setSearching(true);
    setResults([]);

    try {
      const response = await fetch("/api/pinecone/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: filters.query,
          categories: filters.categories,
          maxBudget: filters.maxBudget,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to search experiences");
    } finally {
      setSearching(false);
    }
  }, [filters]);

  return {
    filters,
    updateFilter,
    searching,
    results,
    searchExperiences,
  };
}
