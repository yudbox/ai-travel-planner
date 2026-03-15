import { NextResponse } from "next/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

interface RAGFilters {
  budget?: string;
  emotion?: string;
  location?: string;
  namespace?: string;
}

export async function POST(request: Request) {
  try {
    const { query, topK = 3, filters = {} } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Validate environment variables
    if (!process.env.PINECONE_API_KEY) {
      return NextResponse.json(
        { error: "PINECONE_API_KEY is not configured" },
        { status: 500 },
      );
    }

    if (!process.env.PINECONE_INDEX_NAME) {
      return NextResponse.json(
        {
          error:
            "PINECONE_INDEX_NAME is not configured. Please add it to your .env file",
        },
        { status: 500 },
      );
    }

    const startTime = Date.now();

    // ============================================
    // STEP 1: RETRIEVAL (Search in Pinecone)
    // ============================================
    const retrievalStartTime = Date.now();

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = pinecone.Index({
      name: process.env.PINECONE_INDEX_NAME!,
    });

    // Initialize embeddings model
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });

    // Connect to existing Pinecone index
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: filters.namespace || "", // Empty string searches all namespaces
    });

    // Build metadata filter
    const metadataFilter: Record<string, string> = {};
    if (filters.budget) metadataFilter.budget = filters.budget;
    if (filters.emotion) metadataFilter.emotion = filters.emotion;
    if (filters.location) metadataFilter.location = filters.location;

    // Perform similarity search
    const searchResults = await vectorStore.similaritySearchWithScore(
      query,
      topK,
      Object.keys(metadataFilter).length > 0 ? metadataFilter : undefined,
    );

    const retrievalTime = Date.now() - retrievalStartTime;

    // Format retrieved context
    const retrievedExperiences = searchResults.map(
      ([doc, score]: [any, number]) => ({
        content: doc.pageContent,
        score: parseFloat(score.toFixed(4)),
        metadata: doc.metadata,
      }),
    );

    // If no results found
    if (retrievedExperiences.length === 0) {
      return NextResponse.json({
        error:
          "No relevant experiences found. Try different filters or broader search terms.",
        stage: "retrieval",
      });
    }

    // ============================================
    // STEP 2: AUGMENTED (Build prompt with context)
    // ============================================
    const augmentationStartTime = Date.now();

    const contextText = retrievedExperiences
      .map(
        (exp: any, idx: number) =>
          `Experience ${idx + 1} (relevance: ${exp.score}):\n${exp.content}\nLocation: ${exp.metadata.location || "Unknown"}, Budget: ${exp.metadata.budget || "Unknown"}, Emotion: ${exp.metadata.emotion || "Unknown"}`,
      )
      .join("\n\n");

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an expert travel advisor. Based on REAL traveler experiences provided below, give personalized recommendations. Always reference specific experiences and their details (location, budget, emotions). Be specific and actionable.\n\nTraveler Experiences:\n{context}",
      ],
      ["user", "{query}"],
    ]);

    const augmentationTime = Date.now() - augmentationStartTime;

    // ============================================
    // STEP 3: GENERATION (Generate response with ChatGPT)
    // ============================================
    const generationStartTime = Date.now();

    const chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 600,
    });

    const chain = promptTemplate.pipe(chatModel).pipe(new StringOutputParser());

    const response = await chain.invoke({
      context: contextText,
      query: query,
    });

    const generationTime = Date.now() - generationStartTime;
    const totalTime = Date.now() - startTime;

    // ============================================
    // Return complete RAG pipeline data
    // ============================================
    return NextResponse.json({
      response,
      pipeline: {
        retrieval: {
          status: "completed",
          timeMs: retrievalTime,
          experiencesFound: retrievedExperiences.length,
          experiences: retrievedExperiences,
          filters: metadataFilter,
        },
        augmentation: {
          status: "completed",
          timeMs: augmentationTime,
          contextLength: contextText.length,
          promptStructure: [
            "System: Travel advisor role + context",
            "Context: Retrieved experiences",
            `User Query: ${query}`,
          ],
        },
        generation: {
          status: "completed",
          timeMs: generationTime,
          model: "gpt-4o-mini",
          temperature: 0.7,
        },
        total: {
          timeMs: totalTime,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error in module3-task2:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
