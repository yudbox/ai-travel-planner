/**
 * Spoonacular API client configuration
 */
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";
const API_KEY = process.env.SPOONACULAR_API_KEY!;

export interface SpoonacularRecipeSearchParams {
  diet: string;
  goal?: string;
  restrictions?: string[];
  number?: number;
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

/**
 * Search recipes on Spoonacular
 */
export async function searchSpoonacularRecipes(
  params: SpoonacularRecipeSearchParams,
): Promise<SpoonacularRecipe[]> {
  const { diet, goal, restrictions = [], number = 10 } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    apiKey: API_KEY,
    diet: diet,
    number: number.toString(),
    addRecipeInformation: "true",
    fillIngredients: "true",
  });

  // Add calorie restrictions based on goal
  if (goal === "weight_loss") {
    queryParams.append("maxCalories", "500");
  } else if (goal === "muscle_gain") {
    queryParams.append("minProtein", "30");
  }

  // Add exclusions (restrictions)
  if (restrictions.length > 0) {
    queryParams.append("excludeIngredients", restrictions.join(","));
  }

  const url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?${queryParams.toString()}`;

  console.log("🔍 Searching Spoonacular:", {
    diet,
    goal,
    restrictions,
    url,
  });

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 402) {
        console.warn("⚠️ Spoonacular quota exceeded");
        return [];
      }
      throw new Error(`Spoonacular API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("✅ Spoonacular results:", {
      count: data.results?.length || 0,
      total: data.totalResults || 0,
    });

    return (
      data.results?.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        sourceUrl: recipe.sourceUrl,
      })) || []
    );
  } catch (error) {
    console.error("❌ Spoonacular error:", error);
    return [];
  }
}
