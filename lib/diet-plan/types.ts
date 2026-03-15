import { BaseMessage } from "@langchain/core/messages";

/**
 * Diet Plan State for StateGraph
 */
export interface DietPlanState {
  messages: BaseMessage[];
  dietType?: string; // e.g., "vegan", "keto", "paleo"
  goal?: string; // e.g., "weight_loss", "muscle_gain", "maintenance"
  restrictions?: string[]; // e.g., ["no dairy", "no nuts"]
  recipes?: Recipe[];
  similarPlans?: SimilarPlan[];
  generatedPlan?: string;
  error?: string;
}

/**
 * Recipe from Spoonacular API
 */
export interface Recipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  summary?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

/**
 * Similar Plan from Pinecone Memory
 */
export interface SimilarPlan {
  id: string;
  dietType: string;
  goal: string;
  restrictions: string[];
  plan: string;
  usageCount: number;
  createdAt: string;
  similarity: number;
}

/**
 * Spoonacular API Response
 */
export interface SpoonacularSearchResponse {
  results: Array<{
    id: number;
    title: string;
    image: string;
    imageType: string;
  }>;
  offset: number;
  number: number;
  totalResults: number;
}

/**
 * Spoonacular Recipe Information Response
 */
export interface SpoonacularRecipeInfo {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}
