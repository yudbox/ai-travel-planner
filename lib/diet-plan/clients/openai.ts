import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";

/**
 * Singleton OpenAI embeddings instance
 */
let embeddingsInstance: OpenAIEmbeddings | null = null;

export function getEmbeddings(): OpenAIEmbeddings {
  if (!embeddingsInstance) {
    embeddingsInstance = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });
  }
  return embeddingsInstance;
}

/**
 * Get ChatOpenAI instance for preference extraction
 */
export function getExtractionModel(): ChatOpenAI {
  return new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.3,
  });
}

/**
 * Get ChatOpenAI instance for plan generation
 */
export function getPlanGenerationModel(): ChatOpenAI {
  return new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
  });
}
