import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { Recipe } from "../types";
import { searchSpoonacularRecipes } from "../clients/spoonacular";

/**
 * Search recipes using Spoonacular API
 */
async function searchRecipesAPI(
  diet: string,
  goal: string,
  restrictions: string[],
): Promise<Recipe[]> {
  try {
    const recipes = await searchSpoonacularRecipes({
      diet: diet.toLowerCase(),
      goal,
      restrictions,
      number: 10,
    });

    return recipes.map((r) => ({
      id: r.id,
      title: r.title,
      readyInMinutes: r.readyInMinutes,
      servings: r.servings,
      sourceUrl: r.sourceUrl,
    }));
  } catch (error) {
    console.error("❌ Recipe search error:", error);
    return [];
  }
}

/**
 * LangChain tool for searching recipes
 */
export const searchRecipesTool = new DynamicStructuredTool({
  name: "search_recipes",
  description: `Search for recipes from Spoonacular API based on diet type, goal, and restrictions.
    Use this tool when the user asks to create a diet plan or find recipes.
    Returns up to 10 recipes with titles and images.`,
  schema: z.object({
    diet: z
      .string()
      .describe("Diet type: vegan, vegetarian, paleo, keto, gluten free, etc."),
    goal: z
      .string()
      .describe(
        "User's goal: weight_loss, muscle_gain, maintenance, or general health",
      ),
    restrictions: z
      .array(z.string())
      .optional()
      .describe("Food restrictions or allergies (e.g., 'dairy', 'nuts')"),
  }),
  func: async ({ diet, goal, restrictions = [] }) => {
    const recipes = await searchRecipesAPI(diet, goal, restrictions);

    if (recipes.length === 0) {
      return "No recipes found. The API might be unavailable or quota exceeded. Proceed with general recommendations.";
    }

    return JSON.stringify({
      count: recipes.length,
      recipes: recipes.map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
      })),
    });
  },
});
