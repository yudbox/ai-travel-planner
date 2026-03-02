import { useState, useCallback } from "react";
import { Category, Budget, Season, Companions } from "../_types";

interface AddExperienceFormData {
  description: string;
  category: Category;
  location: string;
  emotions: string[];
  season: Season;
  budget: Budget;
  companions: Companions;
}

export function useAddExperience() {
  const [formData, setFormData] = useState<AddExperienceFormData>({
    description: "",
    category: Category.Nature,
    location: "",
    emotions: [],
    season: Season.Summer,
    budget: Budget.Mid,
    companions: Companions.Solo,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const updateField = useCallback(
    <K extends keyof AddExperienceFormData>(
      field: K,
      value: AddExperienceFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const clearForm = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      description: "",
      location: "",
      emotions: [],
    }));
  }, []);

  const saveExperience = useCallback(async () => {
    if (!formData.description || !formData.location) {
      alert("Please fill in description and location");
      return;
    }

    setSaving(true);
    setSaveSuccess("");

    try {
      const response = await fetch("/api/pinecone/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          category: formData.category,
          metadata: {
            location: formData.location,
            emotions: formData.emotions,
            season: formData.season,
            budget: formData.budget,
            companions: formData.companions,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveSuccess(
          `✅ Saved! ID: ${data.id} | Embedding: ${data.dimensions} dimensions | Namespace: ${data.namespace}`,
        );
        clearForm();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save experience");
    } finally {
      setSaving(false);
    }
  }, [formData, clearForm]);

  return {
    formData,
    updateField,
    saving,
    saveSuccess,
    setSaveSuccess,
    saveExperience,
  };
}
