import { NextRequest, NextResponse } from "next/server";

// Increase timeout for image loading
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const imageUrl = req.nextUrl.searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("🖼️  [IMAGE-PROXY] Fetching image from DIAL");
    console.log("📍 URL:", imageUrl);

    const startTime = Date.now();

    // Use Api-Key header (tested and working for DIAL)
    const response = await fetch(imageUrl, {
      headers: {
        "Api-Key": process.env.DIAL_KEY || "",
      },
      signal: AbortSignal.timeout(25000),
    });

    const elapsed = Date.now() - startTime;
    console.log(`⏱️  Request took: ${elapsed}ms`);
    console.log(`📥 Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No body");
      console.error(`❌ Failed to fetch image: ${response.status}`);
      console.error(`   Error: ${errorText}`);
      throw new Error(
        `Failed to fetch image: ${response.status} - ${errorText}`,
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    console.log(
      `✅ Image loaded: ${imageBuffer.byteLength} bytes (${(imageBuffer.byteLength / 1024).toFixed(2)} KB)`,
    );

    // Return image with correct headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("🚨 [IMAGE-PROXY] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to load image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
