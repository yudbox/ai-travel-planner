/**
 * API Endpoint: Run Aggregation Job
 *
 * POST /api/learning/module4-task1/jobs/aggregation
 *
 * Manually trigger the aggregation job to create master plans from clusters of 50+ similar plans.
 * In production, this should be called by a cron job monthly (e.g., 1st of each month).
 */

import { NextRequest, NextResponse } from "next/server";
import { runAggregation } from "@/lib/diet-plan/jobs/aggregatePlans";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Aggregation job triggered via API");

    const result = await runAggregation();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("❌ Aggregation API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check job status
export async function GET() {
  return NextResponse.json({
    job: "aggregation",
    description:
      "Creates master plans from clusters of 50+ similar individual plans",
    minClusterSize: 50,
    schedule: "Monthly (recommended: 1st of each month)",
    method: "POST",
    endpoint: "/api/learning/module4-task1/jobs/aggregation",
  });
}
