import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

type Budget = "low" | "mid" | "high";

const budgetOrder: Record<Budget, number> = {
  low: 1,
  mid: 2,
  high: 3,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, categories, maxBudget } = body;

    console.log("\n🔍 ===== SEARCH IN PINECONE =====");
    console.log("📥 Search parameters:", {
      query,
      categories,
      maxBudget,
    });

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("🤖 Generating query embedding with OpenAI...");

    // Generate query embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: [query],
    });

    const queryVector = embeddingResponse.data[0].embedding;

    console.log("✅ Query embedding generated:", {
      dimensions: queryVector.length,
      firstValues: queryVector.slice(0, 5),
    });

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });

    const index = pinecone.Index({ name: process.env.PINECONE_INDEX_NAME! });

    // Search across selected categories (namespaces)
    console.log("🔎 Searching in namespaces:", categories);

    const searchPromises = (categories || []).map(async (category: string) => {
      // Build metadata filter
      const filter: any = {};

      // Filter by budget if specified
      if (maxBudget) {
        const maxBudgetValue = budgetOrder[maxBudget as Budget];
        filter.budget = {
          $in: Object.keys(budgetOrder).filter(
            (b) => budgetOrder[b as Budget] <= maxBudgetValue,
          ),
        };
      }

      const queryOptions: any = {
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      };

      // Only add filter if it has properties
      if (Object.keys(filter).length > 0) {
        queryOptions.filter = filter;
      }

      console.log(`📂 Querying namespace "${category}":`, {
        topK: queryOptions.topK,
        hasFilter: Object.keys(filter).length > 0,
        filter,
      });

      const response = await index.namespace(category).query(queryOptions);

      console.log(`📊 Results from "${category}":`, {
        matchCount: response.matches?.length || 0,
        topScore: response.matches?.[0]?.score,
      });

      return response.matches?.map((match: any) => ({
        id: match.id,
        score: match.score,
        description: match.metadata?.description,
        category,
        location: match.metadata?.location,
        emotions: match.metadata?.emotions,
        season: match.metadata?.season,
        budget: match.metadata?.budget,
        companions: match.metadata?.companions,
      }));
    });

    const results = await Promise.all(searchPromises);
    const flatResults = results.flat().filter(Boolean);

    console.log("🔀 Combined results:", {
      totalMatches: flatResults.length,
      byCategory: categories.map((cat: string) => ({
        category: cat,
        count: flatResults.filter((r: any) => r.category === cat).length,
      })),
    });

    // Sort by score descending
    flatResults.sort((a, b) => (b.score || 0) - (a.score || 0));

    console.log("✅ Final sorted results:", {
      count: flatResults.length,
      topResults: flatResults.slice(0, 3).map((r: any) => ({
        id: r.id,
        score: r.score?.toFixed(3),
        category: r.category,
        description: r.description?.substring(0, 50) + "...",
      })),
    });
    console.log("===== SEARCH COMPLETE =====\n");

    return NextResponse.json({
      success: true,
      results: flatResults,
      count: flatResults.length,
    });
  } catch (error) {
    console.error("❌ Search error:", error);
    console.error("===== SEARCH FAILED =====\n");
    return NextResponse.json(
      { error: "Failed to search experiences" },
      { status: 500 },
    );
  }
}
