import { LocationAutocomplete } from "./LocationAutocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Category, Budget, Season, Companions } from "./_types";

const EMOTION_OPTIONS = [
  "peaceful",
  "exciting",
  "romantic",
  "inspiring",
  "energized",
  "relaxed",
  "adventurous",
  "cultural",
];

const CATEGORY_OPTIONS = [
  { value: Category.Nature, label: "Nature" },
  { value: Category.Food, label: "Food" },
  { value: Category.Culture, label: "Culture" },
  { value: Category.Adventure, label: "Adventure" },
  { value: Category.Relaxation, label: "Relaxation" },
];

const SEASON_OPTIONS = [
  { value: Season.Spring, label: "Spring" },
  { value: Season.Summer, label: "Summer" },
  { value: Season.Autumn, label: "Autumn" },
  { value: Season.Winter, label: "Winter" },
];

const BUDGET_OPTIONS = [
  { value: Budget.Low, label: "Low" },
  { value: Budget.Mid, label: "Mid" },
  { value: Budget.High, label: "High" },
];

const COMPANIONS_OPTIONS = [
  { value: Companions.Solo, label: "Solo" },
  { value: Companions.Friends, label: "Friends" },
  { value: Companions.Family, label: "Family" },
  { value: Companions.Partner, label: "Partner" },
];

interface AddExperienceFormProps {
  formData: {
    description: string;
    category: Category;
    location: string;
    emotions: string[];
    season: Season;
    budget: Budget;
    companions: Companions;
  };
  updateField: <K extends keyof AddExperienceFormProps["formData"]>(
    field: K,
    value: AddExperienceFormProps["formData"][K],
  ) => void;
  saving: boolean;
  saveSuccess: string;
  setSaveSuccess: (msg: string) => void;
  saveExperience: () => Promise<void>;
}

export function AddExperienceForm({
  formData,
  updateField,
  saving,
  saveSuccess,
  setSaveSuccess,
  saveExperience,
}: AddExperienceFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        Save Your Travel Experience
      </h3>

      {/* Category */}
      <ButtonGroup
        label="Category (Namespace)"
        options={CATEGORY_OPTIONS}
        value={[formData.category]}
        onChange={(values) => updateField("category", values[0] as Category)}
        multiSelect={false}
      />

      {/* Description */}
      <Textarea
        label="Description (Will generate embedding)"
        value={formData.description}
        onChange={(e) => updateField("description", e.target.value)}
        placeholder="Describe your experience... e.g., 'Watched sunset from Santorini cliff, felt peaceful and inspired'"
        rows={4}
        maxLength={500}
        showCount
      />

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Location (Start typing for suggestions)
        </label>
        <LocationAutocomplete
          value={formData.location}
          onChange={(value) => updateField("location", value)}
        />
      </div>

      {/* Emotions */}
      <ButtonGroup
        label="Emotions (Select multiple)"
        options={EMOTION_OPTIONS.map((emotion) => ({
          value: emotion,
          label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        }))}
        value={formData.emotions}
        onChange={(value) => updateField("emotions", value)}
        multiSelect={true}
      />

      {/* Metadata Row */}
      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Season"
          value={formData.season}
          onChange={(e) => updateField("season", e.target.value as Season)}
          options={SEASON_OPTIONS}
        />

        <Select
          label="Budget"
          value={formData.budget}
          onChange={(e) => updateField("budget", e.target.value as Budget)}
          options={BUDGET_OPTIONS}
        />

        <Select
          label="Companions"
          value={formData.companions}
          onChange={(e) =>
            updateField("companions", e.target.value as Companions)
          }
          options={COMPANIONS_OPTIONS}
        />
      </div>

      {/* Save Button */}
      <Button onClick={saveExperience} disabled={saving} className="w-full">
        {saving ? "Saving..." : "💾 Save to Pinecone"}
      </Button>

      {/* Success Message */}
      {saveSuccess && (
        <Alert variant="success" icon="✅" onClose={() => setSaveSuccess("")}>
          {saveSuccess}{" "}
          <span className="text-xs opacity-70">(auto-hide in 5s)</span>
        </Alert>
      )}
    </div>
  );
}
