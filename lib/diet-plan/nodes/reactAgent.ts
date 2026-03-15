import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { searchRecipesTool } from "../tools/searchRecipes";
import type { DietPlanState, Recipe } from "../types";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.5,
});

const checkpointer = new MemorySaver();

/**
 * ReAct agent that searches for recipes
 */
export async function reactAgent(
  state: DietPlanState,
): Promise<Partial<DietPlanState>> {
  console.log("\n🤖 NODE: ReActAgent");
  console.log("Searching recipes for:", {
    dietType: state.dietType,
    goal: state.goal,
    restrictions: state.restrictions,
  });

  try {
    // Create ReAct agent with searchRecipes tool
    const agent = createReactAgent({
      llm: model,
      tools: [searchRecipesTool],
      checkpointSaver: checkpointer,
    });

    // Build input for agent
    const input = {
      messages: [
        {
          role: "user",
          content: `Search for recipes for a ${state.dietType} diet with goal of ${state.goal}. ${
            state.restrictions && state.restrictions.length > 0
              ? `Exclude: ${state.restrictions.join(", ")}.`
              : ""
          }`,
        },
      ],
    };

    console.log("🔍 Agent input:", input);

    // Invoke agent
    const result = await agent.invoke(input, {
      configurable: { thread_id: "diet-plan-agent" },
    });

    console.log("✅ Agent completed");

    // Extract recipes from tool responses only
    const recipes: Recipe[] = [];

    // Look for ToolMessage responses in agent messages
    if (result.messages) {
      for (const msg of result.messages) {
        // Skip if not a tool message
        if (msg._getType && msg._getType() !== "tool") {
          continue;
        }

        // Check if this is a tool response with recipes
        if (msg.content && typeof msg.content === "string") {
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed.recipes && Array.isArray(parsed.recipes)) {
              // Only add if we don't have recipes yet (avoid duplicates)
              if (recipes.length === 0) {
                recipes.push(...parsed.recipes);
              }
            }
          } catch {
            // Not JSON, skip
          }
        }
      }
    }

    console.log("📦 Extracted recipes:", recipes.length);

    // Limit to 10 recipes max (as per architecture plan)
    const limitedRecipes = recipes.slice(0, 10);

    return {
      recipes: limitedRecipes.length > 0 ? limitedRecipes : [],
      messages: state.messages,
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      similarPlans: state.similarPlans,
      generatedPlan: state.generatedPlan,
    };
  } catch (error) {
    console.error("❌ ReActAgent error:", error);
    return {
      recipes: [],
      error: "Failed to search recipes",
      messages: state.messages,
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      similarPlans: state.similarPlans,
      generatedPlan: state.generatedPlan,
    };
  }
}
