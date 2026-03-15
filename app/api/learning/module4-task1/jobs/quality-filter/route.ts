/**
 * API Endpoint: Run Quality Filtering Job
 *
 * POST /api/learning/module4-task1/jobs/quality-filter
 *
 * Manually trigger the quality filtering job to clean up low-quality diet plans.
 * In production, this should be called by a cron job daily.
 */

import { NextRequest, NextResponse } from "next/server";
import { runQualityFilter } from "@/lib/diet-plan/jobs/qualityFilter";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Quality Filtering job triggered via API");

    const result = await runQualityFilter();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("❌ Quality Filtering API error:", error);

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
    job: "quality-filter",
    description:
      "Deletes low-quality individual plans after 90 days (usage < 5 OR length < 500)",
    schedule: "Daily (recommended)",
    method: "POST",
    endpoint: "/api/learning/module4-task1/jobs/quality-filter",
  });
}
