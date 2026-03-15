import type { DietPlanState } from "../types";
import { getEmbeddings } from "../clients/openai";
import { getDietPlanIndex, getDietPlanNamespace } from "../clients/pinecone";
import { v4 as uuidv4 } from "uuid";

/**
 * Calculate expiration date (90 days from creation)
 */
function calculateExpirationDate(createdAt: string): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 90); // Add 90 days
  return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

/**
 * Save the generated diet plan to Pinecone
 */
export async function saveMemory(
  state: DietPlanState,
): Promise<Partial<DietPlanState>> {
  console.log("\n💾 NODE: SaveMemory");

  if (!state.generatedPlan) {
    console.log("⏭️ No plan to save, skipping");
    return { messages: state.messages };
  }

  try {
    // Generate embedding for the plan
    const planText = `${state.dietType} diet for ${state.goal}${
      state.restrictions && state.restrictions.length > 0
        ? ` without ${state.restrictions.join(", ")}`
        : ""
    }\n\n${state.generatedPlan}`;

    console.log("🔢 Generating embedding...");
    const embeddings = getEmbeddings();
    const planEmbedding = await embeddings.embedQuery(planText);

    // Get Pinecone index and namespace
    const index = getDietPlanIndex();
    const namespace = getDietPlanNamespace();

    console.log("🔍 Checking for duplicates...");

    // Check for duplicates (similarity > 0.98)
    const queryResponse = await index.namespace(namespace).query({
      vector: planEmbedding,
      topK: 1,
      includeMetadata: true,
    });

    let shouldUpsert = true;
    let recordId = uuidv4();

    if (
      queryResponse.matches &&
      queryResponse.matches.length > 0 &&
      queryResponse.matches[0].score &&
      queryResponse.matches[0].score > 0.98
    ) {
      console.log("⚠️ Found duplicate plan (similarity > 0.98)");

      // Increment usage count instead of creating new
      const existingMatch = queryResponse.matches[0];
      recordId = existingMatch.id;

      const currentUsageCount =
        (existingMatch.metadata?.usageCount as number) || 1;

      console.log(
        "🔄 Updating usage count:",
        currentUsageCount,
        "→",
        currentUsageCount + 1,
      );

      const createdAt = String(
        existingMatch.metadata?.createdAt || new Date().toISOString(),
      );
      const expiresAt = calculateExpirationDate(createdAt);

      await index.namespace(namespace).upsert({
        records: [
          {
            id: recordId,
            values: planEmbedding,
            metadata: {
              type: "individual",
              dietType: state.dietType || "unknown",
              goal: state.goal || "unknown",
              restrictions: state.restrictions || [],
              plan: state.generatedPlan,
              plan_length: state.generatedPlan.length,
              usageCount: currentUsageCount + 1,
              created_at: createdAt,
              expires_at: expiresAt,
              updatedAt: new Date().toISOString(),
            },
          },
        ],
      });

      shouldUpsert = false;
    }

    if (shouldUpsert) {
      console.log("💾 Saving new plan to Pinecone...");

      const createdAt = new Date().toISOString();
      const expiresAt = calculateExpirationDate(createdAt);

      await index.namespace(namespace).upsert({
        records: [
          {
            id: recordId,
            values: planEmbedding,
            metadata: {
              type: "individual",
              dietType: state.dietType || "unknown",
              goal: state.goal || "unknown",
              restrictions: state.restrictions || [],
              plan: state.generatedPlan,
              plan_length: state.generatedPlan.length,
              usageCount: 1,
              created_at: createdAt,
              expires_at: expiresAt,
              updatedAt: new Date().toISOString(),
            },
          },
        ],
      });
    }

    console.log("✅ Memory saved:", recordId);

    return {
      messages: state.messages,
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      recipes: state.recipes,
      similarPlans: state.similarPlans,
      generatedPlan: state.generatedPlan,
    };
  } catch (error) {
    console.error("❌ SaveMemory error:", error);

    // Non-critical error, don't fail the flow
    return {
      messages: state.messages,
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      recipes: state.recipes,
      similarPlans: state.similarPlans,
      generatedPlan: state.generatedPlan,
    };
  }
}
