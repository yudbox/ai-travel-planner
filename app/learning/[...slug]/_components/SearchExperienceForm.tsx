import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Category, Budget, Season, Companions } from "./_types";

const CATEGORY_OPTIONS = [
  { value: Category.Nature, label: "Nature" },
  { value: Category.Food, label: "Food" },
  { value: Category.Culture, label: "Culture" },
  { value: Category.Adventure, label: "Adventure" },
  { value: Category.Relaxation, label: "Relaxation" },
];

const BUDGET_OPTIONS = [
  { value: Budget.Low, label: "Low" },
  { value: Budget.Mid, label: "Mid" },
  { value: Budget.High, label: "High" },
];

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

interface SearchExperienceFormProps {
  filters: {
    query: string;
    categories: Category[];
    maxBudget: Budget;
  };
  updateFilter: <K extends keyof SearchExperienceFormProps["filters"]>(
    field: K,
    value: SearchExperienceFormProps["filters"][K],
  ) => void;
  searching: boolean;
  results: Experience[];
  searchExperiences: () => Promise<void>;
}

export function SearchExperienceForm({
  filters,
  updateFilter,
  searching,
  results,
  searchExperiences,
}: SearchExperienceFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        Search Travel Experiences
      </h3>

      {/* Search Query */}
      <Input
        label="Search Query (Semantic Search)"
        type="text"
        value={filters.query}
        onChange={(e) => updateFilter("query", e.target.value)}
        placeholder="e.g., 'romantic moments', 'adventure and adrenaline', 'peaceful places'"
      />

      {/* Category Filters */}
      <ButtonGroup
        label="Search in Categories"
        options={CATEGORY_OPTIONS}
        value={filters.categories}
        onChange={(values) => updateFilter("categories", values as Category[])}
        multiSelect={true}
      />

      {/* Budget Filter */}
      <Select
        label="Max Budget"
        value={filters.maxBudget}
        onChange={(e) => updateFilter("maxBudget", e.target.value as Budget)}
        options={BUDGET_OPTIONS}
      />

      {/* Search Button */}
      <Button
        onClick={searchExperiences}
        disabled={searching}
        className="w-full"
      >
        {searching ? "Searching..." : "🔍 Search"}
      </Button>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            📊 Found {results.length} matches
          </h4>
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div
                key={result.id || idx}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-blue-600 capitalize">
                    {result.category}
                  </span>
                  {result.score !== undefined && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        result.score > 0.8
                          ? "bg-green-100 text-green-800"
                          : result.score > 0.6
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      Score: {result.score.toFixed(3)}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 dark:text-gray-200 mb-2">
                  {result.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>📍 {result.location}</span>
                  <span>💰 {result.budget}</span>
                  <span>🌤️ {result.season}</span>
                  <span>👥 {result.companions}</span>
                  {result.emotions && result.emotions.length > 0 && (
                    <span>😊 {result.emotions.join(", ")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searching && results.length === 0 && filters.query && (
        <p className="text-gray-600 dark:text-gray-400 text-center py-4">
          No results found. Try different search terms or filters.
        </p>
      )}
    </div>
  );
}
