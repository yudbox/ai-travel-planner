import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, category, metadata } = body;

    console.log("\n💾 ===== SAVE TO PINECONE =====");
    console.log("📥 Request data:", {
      category,
      description: description.substring(0, 100) + "...",
      metadata,
    });

    if (!description || !category) {
      return NextResponse.json(
        { error: "Description and category are required" },
        { status: 400 },
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("🤖 Generating embedding with OpenAI...");

    // Generate embedding from description
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: [description],
    });

    const embedding = embeddingResponse.data[0].embedding;

    console.log("✅ Embedding generated:", {
      dimensions: embedding.length,
      firstValues: embedding.slice(0, 5),
      model: "text-embedding-3-small",
    });

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });

    const index = pinecone.Index({ name: process.env.PINECONE_INDEX_NAME! });

    // Generate unique ID
    const id = `experience-${category}-${Date.now()}`;

    console.log("📌 Upserting to Pinecone:", {
      id,
      namespace: category,
      index: process.env.PINECONE_INDEX_NAME,
      vectorDimensions: embedding.length,
    });

    // Upsert to Pinecone with namespace (category)
    await index.namespace(category).upsert({
      records: [
        {
          id,
          values: embedding,
          metadata: {
            description,
            ...metadata,
          },
        },
      ],
    });

    console.log("✅ Successfully saved to Pinecone!");
    console.log("===== SAVE COMPLETE =====\n");

    return NextResponse.json({
      success: true,
      id,
      dimensions: embedding.length,
      namespace: category,
    });
  } catch (error) {
    console.error("❌ Save error:", error);
    console.error("===== SAVE FAILED =====\n");
    return NextResponse.json(
      { error: "Failed to save experience" },
      { status: 500 },
    );
  }
}
