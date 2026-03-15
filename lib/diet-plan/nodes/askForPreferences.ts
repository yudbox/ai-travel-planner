import { AIMessage } from "@langchain/core/messages";
import type { DietPlanState } from "../types";

/**
 * Ask user for missing preferences
 */
export async function askForPreferences(
  state: DietPlanState,
): Promise<Partial<DietPlanState>> {
  console.log("\n💬 NODE: AskForPreferences");

  const missingFields: string[] = [];

  if (!state.dietType) {
    missingFields.push(
      "diet type (e.g., vegan, keto, paleo, or 'no restrictions' for omnivore)",
    );
  }

  if (!state.goal) {
    missingFields.push("goal (e.g., weight loss, muscle gain, or maintenance)");
  }

  const message = `To create a personalized diet plan, I need some information:

${missingFields.map((field, i) => `${i + 1}. Your ${field}`).join("\n")}

Please provide these details, and I'll create a customized 7-day meal plan for you!`;

  console.log("📤 Asking user:", message);

  // CRITICAL: Always return ALL fields to preserve state
  // LangGraph may reset fields not included in return object
  return {
    messages: [...state.messages, new AIMessage(message)],
    dietType: state.dietType, // Preserve existing
    goal: state.goal, // Preserve existing
    restrictions: state.restrictions, // Preserve existing
  };
}
