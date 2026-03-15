import { Pinecone } from "@pinecone-database/pinecone";

/**
 * Singleton Pinecone client
 */
let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

/**
 * Get Pinecone index for diet plans
 */
export function getDietPlanIndex() {
  const pc = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX;
  if (!indexName) {
    throw new Error("Provide indexName");
  }
  return pc.Index({ name: indexName });
}

/**
 * Get namespace for diet plans
 */
export function getDietPlanNamespace(): string {
  return process.env.PINECONE_NAMESPACE ?? "";
}
