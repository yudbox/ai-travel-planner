"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { useAddExperience, useSearchExperiences, useAutoHide } from "./_hooks";
import { Mode } from "./_types";
import { AddExperienceForm } from "./AddExperienceForm";
import { SearchExperienceForm } from "./SearchExperienceForm";

export function TravelExperiences() {
  const [mode, setMode] = useState<Mode>(Mode.Add);

  // Custom hooks for business logic
  const {
    formData,
    updateField,
    saving,
    saveSuccess,
    setSaveSuccess,
    saveExperience,
  } = useAddExperience();

  const { filters, updateFilter, searching, results, searchExperiences } =
    useSearchExperiences();

  // Auto-hide success message
  useAutoHide(saveSuccess, () => setSaveSuccess(""), 5000);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Mode Switcher */}
      <Tabs
        tabs={[
          { value: Mode.Add, label: "Add Experience", icon: "📝" },
          { value: Mode.Search, label: "Search Experiences", icon: "🔍" },
        ]}
        value={mode}
        onValueChange={(value) => setMode(value as Mode)}
        className="mb-6"
      />

      {/* Add Mode */}
      {mode === Mode.Add && (
        <AddExperienceForm
          formData={formData}
          updateField={updateField}
          saving={saving}
          saveSuccess={saveSuccess}
          setSaveSuccess={setSaveSuccess}
          saveExperience={saveExperience}
        />
      )}

      {/* Search Mode */}
      {mode === Mode.Search && (
        <SearchExperienceForm
          filters={filters}
          updateFilter={updateFilter}
          searching={searching}
          results={results}
          searchExperiences={searchExperiences}
        />
      )}
    </div>
  );
}
