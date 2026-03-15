import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { DietPlanState } from "../types";
import { getPlanGenerationModel } from "../clients/openai";

/**
 * Generate a detailed 7-day diet plan
 */
export async function generatePlan(
  state: DietPlanState,
): Promise<Partial<DietPlanState>> {
  console.log("\n📋 NODE: GeneratePlan");

  try {
    // Build context from previous nodes
    const recipesContext =
      state.recipes && state.recipes.length > 0
        ? `\n\n**Available Recipes:**\n${state.recipes
            .map((r) => `- ${r.title} (${r.readyInMinutes} min)`)
            .join("\n")}`
        : "";

    const similarPlansContext =
      state.similarPlans && state.similarPlans.length > 0
        ? `\n\n**Similar Plans (for reference):**\n${state.similarPlans
            .map(
              (p, i) =>
                `${i + 1}. ${p.dietType} for ${p.goal} (used ${p.usageCount} times)\n${p.plan.substring(0, 200)}...`,
            )
            .join("\n\n")}`
        : "";

    const prompt = `You are a professional nutritionist. Create a detailed 7-day diet plan.

**User Preferences:**
- Diet Type: ${state.dietType}
- Goal: ${state.goal}
- Restrictions: ${state.restrictions && state.restrictions.length > 0 ? state.restrictions.join(", ") : "None"}

${recipesContext}${similarPlansContext}

**Instructions:**
1. Create a 7-day plan (Monday to Sunday)
2. Each day should have 3 meals: Breakfast, Lunch, Dinner
3. Include recipe names when possible from the available recipes
4. Provide approximate calories and macros for each meal
5. Add daily total calories and macros
6. Include 1-2 snack suggestions per day
7. Use the similar plans as inspiration if available

**Format:**
## Day 1 (Monday)
**Breakfast:** [Recipe name] - [calories]kcal (P:[protein]g, C:[carbs]g, F:[fat]g)
**Lunch:** ...
**Dinner:** ...
**Snacks:** ...
**Daily Total:** [total]kcal

... (repeat for 7 days)

Generate the plan now:`;

    console.log("🤔 Generating plan with GPT-4...");

    const model = getPlanGenerationModel();
    const response = await model.invoke([new HumanMessage(prompt)]);

    const generatedPlan =
      typeof response.content === "string" ? response.content : "";

    console.log("✅ Plan generated:", generatedPlan.length, "characters");

    // Validate plan length
    if (generatedPlan.length < 500) {
      console.warn("⚠️ Generated plan seems too short");
      return {
        error: "Generated plan is too short",
        messages: [
          ...state.messages,
          new AIMessage(
            "I couldn't generate a complete diet plan. Please try again.",
          ),
        ],
        dietType: state.dietType,
        goal: state.goal,
        restrictions: state.restrictions,
        recipes: state.recipes,
        similarPlans: state.similarPlans,
        generatedPlan: state.generatedPlan,
      };
    }

    return {
      generatedPlan,
      messages: [
        ...state.messages,
        new AIMessage("I've created your personalized 7-day diet plan! 🎉"),
      ],
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      recipes: state.recipes,
      similarPlans: state.similarPlans,
    };
  } catch (error) {
    console.error("❌ GeneratePlan error:", error);
    return {
      error: "Failed to generate diet plan",
      messages: [
        ...state.messages,
        new AIMessage(
          "Sorry, I encountered an error while generating your diet plan. Please try again.",
        ),
      ],
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      recipes: state.recipes,
      similarPlans: state.similarPlans,
      generatedPlan: state.generatedPlan,
    };
  }
}
