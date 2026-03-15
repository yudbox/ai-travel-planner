/**
 * Aggregation Job
 *
 * Creates "master plans" from clusters of 50+ similar individual plans:
 * 1. Group plans by dietType + calorie range (±200 cal)
 * 2. For clusters with 50+ plans, extract top 10 recipes
 * 3. Create aggregated master plan (type: "aggregated", expires_at: null)
 * 4. Master plans are NEVER deleted by Quality Filtering
 *
 * Run this job monthly (e.g., 1st of each month) via cron or API endpoint.
 */

import { getDietPlanIndex, getDietPlanNamespace } from "../clients/pinecone";
import { getEmbeddings } from "../clients/openai";

const MIN_CLUSTER_SIZE = 50; // Minimum plans to create master plan

interface PlanMetadata {
  type: "individual" | "aggregated";
  dietType?: string;
  goal?: string;
  restrictions?: string;
  calories?: number;
  created_at: string;
  usage_count: number;
  plan_length: number;
  expires_at?: string;
  source_plans?: number; // For aggregated plans
}

interface RecipeCount {
  id: number;
  title: string;
  count: number;
}

export async function runAggregation() {
  console.log("🎯 Starting Aggregation job...");

  const index = getDietPlanIndex();
  const namespace = getDietPlanNamespace();

  try {
    // Step 1: List all record IDs (paginated)
    console.log("📋 Listing all record IDs...");
    const allIds: string[] = [];
    let paginationToken: string | undefined = undefined;

    do {
      const listResponse = await index.namespace(namespace).listPaginated({
        limit: 100,
        paginationToken,
      });

      const ids =
        listResponse.vectors
          ?.map((v) => v.id)
          .filter((id): id is string => !!id) || [];
      allIds.push(...ids);
      paginationToken = listResponse.pagination?.next;

      console.log(`   📄 Fetched ${ids.length} IDs (total: ${allIds.length})`);
    } while (paginationToken);

    console.log(`📊 Found ${allIds.length} total records`);

    if (allIds.length === 0) {
      console.log("⚠️ No records in namespace");
      return {
        success: true,
        masterPlansCreated: 0,
        totalIndividualPlans: 0,
        clusters: 0,
        details: [],
      };
    }

    // Step 2: Fetch metadata in batches (Pinecone fetch limit: 1000 per request)
    console.log("📦 Fetching metadata...");
    const matches: Array<{ id: string; metadata?: Record<string, unknown> }> =
      [];
    const batchSize = 1000;

    for (let i = 0; i < allIds.length; i += batchSize) {
      const batch = allIds.slice(i, i + batchSize);
      const fetchResponse = await index
        .namespace(namespace)
        .fetch({ ids: batch });

      for (const [id, record] of Object.entries(fetchResponse.records || {})) {
        matches.push({
          id,
          metadata: record.metadata as Record<string, unknown>,
        });
      }

      console.log(
        `   ✅ Fetched batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allIds.length / batchSize)}`,
      );
    }

    console.log(`📊 Found ${matches.length} total plans`);

    // Filter only individual plans (or plans without type - legacy records)
    const individualPlans = matches.filter(
      (match: { metadata?: Record<string, unknown> }) => {
        const metadata = match.metadata as unknown as PlanMetadata;
        return metadata?.type === "individual" || !metadata?.type; // Include legacy plans without type field
      },
    );

    console.log(`👤 Individual plans: ${individualPlans.length}`);

    // Step 2: Group plans into clusters by dietType + calorie range
    const clusters = new Map<string, typeof matches>();

    for (const plan of individualPlans) {
      const metadata = plan.metadata as unknown as PlanMetadata;
      const dietType = metadata.dietType || "unknown";

      // Extract calories from plan text (rough estimate)
      const calories = metadata.calories || extractCaloriesFromText(plan.id);
      const calorieRange = Math.floor(calories / 200) * 200; // Round to nearest 200 (e.g., 1800, 2000, 2200)

      const clusterKey = `${dietType}_${calorieRange}cal`;

      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(plan);
    }

    console.log(`🗂️  Created ${clusters.size} clusters`);

    // Step 3: Process each cluster with 50+ plans
    const masterPlans: Array<{
      clusterKey: string;
      planCount: number;
      topRecipes: RecipeCount[];
      avgCalories: number;
      dietType: string;
    }> = [];

    for (const [clusterKey, plans] of clusters.entries()) {
      if (plans.length < MIN_CLUSTER_SIZE) {
        console.log(
          `⏭️  Skipping cluster ${clusterKey}: only ${plans.length} plans (need ${MIN_CLUSTER_SIZE}+)`,
        );
        continue;
      }

      console.log(
        `\n📦 Processing cluster: ${clusterKey} (${plans.length} plans)`,
      );

      // Extract recipes from all plans in cluster
      const recipeFrequency = new Map<string, RecipeCount>();
      let totalCalories = 0;

      for (const plan of plans) {
        const metadata = plan.metadata as unknown as PlanMetadata;
        const recipes = extractRecipesFromPlan(plan.id); // Parse recipes from plan text

        for (const recipe of recipes) {
          const key = `${recipe.id}_${recipe.title}`;
          if (!recipeFrequency.has(key)) {
            recipeFrequency.set(key, { ...recipe, count: 0 });
          }
          recipeFrequency.get(key)!.count++;
        }

        totalCalories += metadata.calories || 2000;
      }

      // Sort recipes by frequency and take top 10
      const topRecipes = Array.from(recipeFrequency.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const avgCalories = Math.round(totalCalories / plans.length);
      const [dietType, calorieRange] = clusterKey.split("_");

      masterPlans.push({
        clusterKey,
        planCount: plans.length,
        topRecipes,
        avgCalories,
        dietType,
      });

      console.log(
        `   ✅ Top 10 recipes extracted (most frequent: "${topRecipes[0]?.title}" - ${topRecipes[0]?.count} times)`,
      );
    }

    // Step 4: Create and save master plans to Pinecone
    console.log(
      `\n💾 Saving ${masterPlans.length} master plans to Pinecone...`,
    );

    for (const master of masterPlans) {
      const planText = generateMasterPlanText(master);
      const embedding = await generateEmbedding(planText);

      const id = `master_${master.clusterKey}_${Date.now()}`;
      const today = new Date().toISOString().split("T")[0];

      await index.namespace(namespace).upsert({
        records: [
          {
            id,
            values: embedding,
            metadata: {
              type: "aggregated",
              dietType: master.dietType,
              calories: master.avgCalories,
              source_plans: master.planCount,
              created_at: today,
              expires_at: "null", // Never expires!
              plan_length: planText.length,
              usage_count: 0,
            },
          },
        ],
      });

      console.log(
        `   ✅ Saved master plan: ${id} (from ${master.planCount} plans)`,
      );
    }

    console.log(
      `\n✅ Aggregation complete! Created ${masterPlans.length} master plans.`,
    );

    return {
      success: true,
      masterPlansCreated: masterPlans.length,
      totalIndividualPlans: individualPlans.length,
      clusters: clusters.size,
      details: masterPlans.map((m) => ({
        dietType: m.dietType,
        planCount: m.planCount,
        avgCalories: m.avgCalories,
        recipesIncluded: m.topRecipes.length,
      })),
    };
  } catch (error) {
    console.error("❌ Aggregation job failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper: Extract calories from plan text (rough heuristic)
function extractCaloriesFromText(planId: string): number {
  // In production, parse the actual plan text
  // For now, return default 2000
  return 2000;
}

// Helper: Extract recipes from plan text
function extractRecipesFromPlan(planId: string): RecipeCount[] {
  // In production, parse the actual plan JSON/text
  // For now, return empty array (this would need to fetch actual plan text)
  return [];
}

// Helper: Generate master plan text
function generateMasterPlanText(master: {
  clusterKey: string;
  planCount: number;
  topRecipes: RecipeCount[];
  avgCalories: number;
  dietType: string;
}): string {
  const recipes = master.topRecipes
    .map((r, idx) => `${idx + 1}. ${r.title} (recommended by ${r.count} users)`)
    .join("\n");

  return `
🎯 Popular ${master.dietType} Diet Plan (Aggregated from ${master.planCount} users)

📊 Average Calories: ${master.avgCalories} kcal/day

🍽️ Top Recommended Recipes:
${recipes}

✨ This is a master plan created from the most successful recipes across ${master.planCount} individual diet plans.
`.trim();
}

// Helper: Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = getEmbeddings();
  return await embeddings.embedQuery(text);
}
