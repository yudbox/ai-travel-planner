import type { LanguageModel } from "ai";

/**
 * Message roles for OpenAI API
 */
export enum MessageRole {
  User = "user",
  Assistant = "assistant",
  System = "system",
}

/**
 * Builds generateText parameters based on task type
 * @param commonParams - Common API parameters (model, temperature, topP, maxTokens)
 * @param options - Task-specific options (prompt, systemMessage, chatHistory)
 * @returns Parameters for generateText call
 */
export function buildGenerateTextParams(
  commonParams: {
    model: LanguageModel;
    temperature: number;
    topP: number;
    maxTokens: number;
  },
  {
    prompt,
    systemMessage,
    chatHistory,
  }: {
    prompt: string;
    systemMessage?: string;
    chatHistory?: Array<{ role: string; content: string }>;
  },
) {
  // Task 5: Chat with context (send full history)
  if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
    return {
      ...commonParams,
      messages: [
        ...chatHistory.map((msg) => ({
          role: msg.role as MessageRole,
          content: msg.content,
        })),
        { role: MessageRole.User, content: prompt },
      ],
    };
  }

  // Task 2: Use messages with roles (system + user)
  if (systemMessage) {
    return {
      ...commonParams,
      messages: [
        { role: MessageRole.System, content: systemMessage },
        { role: MessageRole.User, content: prompt },
      ],
    };
  }

  // Task 1, 3, 4: Simple prompt
  return {
    ...commonParams,
    prompt,
  };
}
