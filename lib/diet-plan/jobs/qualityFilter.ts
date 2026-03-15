/**
 * Quality Filtering Job
 *
 * Deletes low-quality individual diet plans after 90 days:
 * - usage_count < 5 (unpopular)
 * - plan_length < 500 chars (incomplete)
 * - type: "individual" only (aggregated plans are NEVER deleted)
 *
 * Run this job daily via cron or manually via API endpoint.
 */

import { getDietPlanIndex, getDietPlanNamespace } from "../clients/pinecone";

interface PlanMetadata {
  type: "individual" | "aggregated";
  created_at: string;
  usage_count: number;
  plan_length: number;
  expires_at: string;
  dietType?: string;
  goal?: string;
  restrictions?: string;
}

export async function runQualityFilter() {
  console.log("🧹 Starting Quality Filtering job...");

  const index = getDietPlanIndex();
  const namespace = getDietPlanNamespace();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

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
      console.log("✨ No plans in database");
      return {
        success: true,
        deletedCount: 0,
        totalScanned: 0,
        message: "No plans found",
      };
    }

    // Step 2: Fetch metadata in batches (Pinecone fetch limit: 1000 per request)
    console.log("📦 Fetching metadata...");
    const matches: Array<{ id: string; metadata?: Record<string, unknown> }> =
      [];
    const fetchBatchSize = 1000;

    for (let i = 0; i < allIds.length; i += fetchBatchSize) {
      const batch = allIds.slice(i, i + fetchBatchSize);
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
        `   ✅ Fetched batch ${Math.floor(i / fetchBatchSize) + 1}/${Math.ceil(allIds.length / fetchBatchSize)}`,
      );
    }

    console.log(`📊 Found ${matches.length} total plans in Pinecone`);

    // Step 3: Filter plans that meet deletion criteria
    const plansToDelete: string[] = [];

    for (const match of matches) {
      const metadata = match.metadata as unknown as PlanMetadata;

      // Skip if not individual plan (aggregated plans never expire)
      if (metadata.type !== "individual") {
        continue;
      }

      // Skip if not expired yet
      if (metadata.expires_at >= today) {
        continue;
      }

      // Check quality criteria
      const isLowQuality =
        metadata.usage_count < 5 || metadata.plan_length < 500;

      if (isLowQuality) {
        plansToDelete.push(match.id);
        console.log(
          `❌ Marking for deletion: ${match.id} ` +
            `(usage: ${metadata.usage_count}, length: ${metadata.plan_length}, ` +
            `age: ${metadata.created_at})`,
        );
      } else {
        console.log(
          `✅ Keeping: ${match.id} ` +
            `(usage: ${metadata.usage_count}, length: ${metadata.plan_length})`,
        );
      }
    }

    // Step 4: Delete in batches (Pinecone has batch size limits)
    if (plansToDelete.length === 0) {
      console.log("✨ No plans to delete. Database is clean!");
      return {
        success: true,
        deletedCount: 0,
        totalScanned: matches.length,
        message: "No low-quality plans found",
      };
    }

    console.log(`🗑️  Deleting ${plansToDelete.length} low-quality plans...`);

    // Delete in batches of 100
    const deleteBatchSize = 100;
    for (let i = 0; i < plansToDelete.length; i += deleteBatchSize) {
      const batch = plansToDelete.slice(i, i + deleteBatchSize);
      await index.namespace(namespace).deleteMany(batch);
      console.log(
        `   Deleted batch ${Math.floor(i / deleteBatchSize) + 1}/${Math.ceil(plansToDelete.length / deleteBatchSize)}`,
      );
    }

    console.log(
      `✅ Quality Filtering complete! Deleted ${plansToDelete.length} plans.`,
    );

    return {
      success: true,
      deletedCount: plansToDelete.length,
      totalScanned: matches.length,
      message: `Deleted ${plansToDelete.length} low-quality plans`,
    };
  } catch (error) {
    console.error("❌ Quality Filtering job failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
