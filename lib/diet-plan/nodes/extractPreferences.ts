import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { DietPlanState } from "../types";
import { getExtractionModel } from "../clients/openai";

/**
 * Extract diet preferences from user message
 */
export async function extractPreferences(
  state: DietPlanState,
): Promise<Partial<DietPlanState>> {
  console.log("\n🔍 NODE: ExtractPreferences");

  const lastMessage = state.messages[state.messages.length - 1];
  const userMessage = lastMessage.content as string;

  console.log("📥 User message:", userMessage);

  try {
    const extractionPrompt = `You are an AI assistant that extracts diet preferences from user messages.

Extract the following information from the user's message:
1. dietType: The type of diet
   
   RUSSIAN → ENGLISH MAPPINGS (use these exact values):
   - "веган", "вегань", "vegan" → "vegan"
   - "вегетарианец", "вегетарианка", "вегетарианская", "vegetarian" → "vegetarian"
   - "кето", "кетодиета", "кетогенная", "keto", "ketogenic" → "keto"
   - "палео", "paleo", "paleolithic" → "paleo"
   - "глютен фри", "без глютена", "gluten free" → "gluten free"
   - "средиземноморская", "mediterranean" → "mediterranean"
   - "без предпочтений", "нет ограничений", "ем все", "все подряд", "обычная диета", "обычная еда", "мясо рыбу молоко", "no restrictions", "no preferences", "omnivore" → "omnivore"
   
   - If user mentions specific diet → extract it
   - If NO diet mentioned at all → return null (don't assume!)

2. goal: User's goal (e.g., "weight_loss", "muscle_gain", "maintenance")
   
   RUSSIAN → ENGLISH MAPPINGS:
   - "похудеть", "скинуть вес", "сбросить вес", "минус X кг", "худеть", "weight loss", "lose weight" → "weight_loss"
   - "набрать массу", "набрать мышцы", "нарастить мышцы", "мышечная масса", "gain muscle", "muscle gain", "build muscle" → "muscle_gain"
   - "поддержать вес", "поддерживать форму", "maintenance", "maintain weight" → "maintenance"
   
   - If no goal mentioned → return null

3. restrictions: Any food restrictions or allergies (array of strings)
   - If user says "без ограничений", "никаких ограничений", "no restrictions" → empty array []
   - Otherwise extract specific restrictions (e.g., ["dairy", "nuts"])

User message: "${userMessage}"

CRITICAL RULES:
- Return null if information is NOT explicitly stated
- Don't make assumptions or use defaults
- Only extract what user actually said
- Match Russian words to English diet type names

Response format (JSON only, no markdown):
{
  "dietType": "vegan" | "vegetarian" | "keto" | "paleo" | "omnivore" | "gluten free" | "mediterranean" | null,
  "goal": "weight_loss" | "muscle_gain" | "maintenance" | null,
  "restrictions": []
}`;

    const model = getExtractionModel();
    const response = await model.invoke([new HumanMessage(extractionPrompt)]);

    console.log("🤖 LLM response:", response.content);

    // Parse JSON from response
    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.log("❌ No JSON found in response");
      return { error: "Failed to extract preferences" };
    }

    const extracted = JSON.parse(jsonMatch[0]);

    console.log("✅ Extracted preferences:", extracted);
    console.log("🔍 Current state:", {
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
    });

    // CRITICAL: Always return ALL fields to preserve state
    // If we don't return a field, LangGraph may reset it to default
    const updates: Partial<DietPlanState> = {
      messages: state.messages,
      dietType: state.dietType, // Start with existing
      goal: state.goal, // Start with existing
      restrictions: state.restrictions || [], // Start with existing
    };

    // Update with new extracted values if present
    if (extracted.dietType && typeof extracted.dietType === "string") {
      updates.dietType = extracted.dietType;
      console.log("✅ Setting dietType:", extracted.dietType);
    } else {
      console.log("✅ Preserving dietType:", state.dietType || "null");
    }

    if (extracted.goal && typeof extracted.goal === "string") {
      updates.goal = extracted.goal;
      console.log("✅ Setting goal:", extracted.goal);
    } else {
      console.log("✅ Preserving goal:", state.goal || "null");
    }

    if (
      extracted.restrictions &&
      Array.isArray(extracted.restrictions) &&
      extracted.restrictions.length > 0
    ) {
      updates.restrictions = extracted.restrictions;
      console.log("✅ Setting restrictions:", extracted.restrictions);
    } else {
      console.log("✅ Preserving restrictions:", state.restrictions || []);
    }

    console.log("📤 Returning updates:", updates);

    return updates;
  } catch (error) {
    console.error("❌ ExtractPreferences error:", error);
    return {
      error: "Failed to extract preferences",
      messages: state.messages,
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
    };
  }
}
