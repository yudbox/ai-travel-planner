/**
 * Token Counting Utilities for Production
 * Uses js-tiktoken for accurate token counting (same as OpenAI)
 */

import { getEncoding } from "js-tiktoken";

// Initialize encoder once (reuse for performance)
const encoder = getEncoding("gpt2");

/**
 * Count tokens in text using GPT-2 tokenizer
 * This matches OpenAI's token counting for billing and limits
 */
export function countTokens(text: string): number {
  try {
    const encoded = encoder.encode(text);
    return encoded.length;
  } catch (error) {
    console.error("Error counting tokens:", error);
    // Fallback to approximate counting if encoding fails
    return Math.ceil(text.length / 4);
  }
}
