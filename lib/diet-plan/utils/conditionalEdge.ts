import type { DietPlanState } from "../types";

/**
 * Decide next node based on extracted preferences
 */
export function shouldAskForPreferences(state: DietPlanState): string {
  console.log("\n🔀 CONDITIONAL: Checking if we can proceed...");
  console.log("State:", {
    dietType: state.dietType,
    goal: state.goal,
    restrictions: state.restrictions,
  });

  // Check if we have required information
  if (state.dietType && state.goal) {
    console.log("✅ All required info present -> Proceeding to ReActAgent");
    return "reactAgent";
  }

  const missing = [];
  if (!state.dietType) missing.push("dietType");
  if (!state.goal) missing.push("goal");

  console.log("⚠️ Missing info:", missing.join(", "), "-> Need to ask user");
  return "askForPreferences";
}
