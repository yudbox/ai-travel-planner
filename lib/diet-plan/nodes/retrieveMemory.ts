import type { DietPlanState, SimilarPlan } from "../types";
import { getEmbeddings } from "../clients/openai";
import { getDietPlanIndex, getDietPlanNamespace } from "../clients/pinecone";

/**
 * Retrieve similar diet plans from Pinecone
 */
export async function retrieveMemory(
  state: DietPlanState,
): Promise<Partial<DietPlanState>> {
  console.log("\n🔍 NODE: RetrieveMemory");

  try {
    // Build query text from preferences
    const queryText = `${state.dietType} diet for ${state.goal}${
      state.restrictions && state.restrictions.length > 0
        ? ` without ${state.restrictions.join(", ")}`
        : ""
    }`;

    console.log("📝 Query:", queryText);

    // Generate embedding
    const embeddings = getEmbeddings();
    const queryEmbedding = await embeddings.embedQuery(queryText);

    // Get Pinecone index and namespace
    const index = getDietPlanIndex();
    const namespace = getDietPlanNamespace();

    console.log("🔗 Querying Pinecone:", { namespace });

    // Query similar plans
    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    console.log("✅ Found matches:", queryResponse.matches?.length || 0);

    // Parse similar plans
    const similarPlans: SimilarPlan[] = [];

    if (queryResponse.matches) {
      for (const match of queryResponse.matches) {
        console.log("🔍 Match:", {
          id: match.id,
          score: match.score,
          hasMetadata: !!match.metadata,
          metadata: match.metadata,
        });

        // Lower threshold to 0.5 to catch more similar plans
        if (match.metadata && match.score && match.score > 0.5) {
          similarPlans.push({
            id: match.id,
            dietType: match.metadata.dietType as string,
            goal: match.metadata.goal as string,
            restrictions: (match.metadata.restrictions as string[]) || [],
            plan: match.metadata.plan as string,
            usageCount: (match.metadata.usageCount as number) || 1,
            createdAt: match.metadata.createdAt as string,
            similarity: match.score,
          });
        } else {
          console.log("⏭️ Skipped match (score too low or no metadata)");
        }
      }
    }

    console.log("📊 Similar plans:", similarPlans.length);

    return {
      similarPlans,
      messages: state.messages,
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      recipes: state.recipes,
      generatedPlan: state.generatedPlan,
    };
  } catch (error) {
    console.error("❌ RetrieveMemory error:", error);

    // Graceful degradation - continue without similar plans
    return {
      similarPlans: [],
      messages: state.messages,
      dietType: state.dietType,
      goal: state.goal,
      restrictions: state.restrictions,
      recipes: state.recipes,
      generatedPlan: state.generatedPlan,
    };
  }
}
