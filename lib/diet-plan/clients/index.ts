/**
 * Centralized clients for Diet Plan Agent
 *
 * All external service clients are initialized here for:
 * - Code reusability
 * - Centralized configuration
 * - Potential connection pooling/caching
 */

export {
  getPineconeClient,
  getDietPlanIndex,
  getDietPlanNamespace,
} from "./pinecone";

export {
  getEmbeddings,
  getExtractionModel,
  getPlanGenerationModel,
} from "./openai";

export { searchSpoonacularRecipes } from "./spoonacular";
export type {
  SpoonacularRecipeSearchParams,
  SpoonacularRecipe,
} from "./spoonacular";
