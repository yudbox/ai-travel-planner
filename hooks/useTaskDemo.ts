import { useState } from "react";
import type { TaskConfig } from "@/app/learning/tasks-config";
import { MessageRole } from "@/app/api/learning/helpers";

interface UseTaskDemoParams {
  config: TaskConfig;
  slug: string[];
}

interface UseTaskDemoReturn {
  // Input states
  systemMessage: string;
  setSystemMessage: (value: string) => void;
  prompt: string;
  setPrompt: (value: string) => void;

  // Response states
  response: string;
  loading: boolean;
  error: string;

  // Parameter states
  temperature: number;
  setTemperature: (value: number) => void;
  topP: number;
  setTopP: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  n: number;
  setN: (value: number) => void;
  frequencyPenalty: number;
  setFrequencyPenalty: (value: number) => void;
  seed: number | undefined;
  setSeed: (value: number | undefined) => void;

  // Chat states
  chatMessages: Array<{ role: MessageRole; content: string }>;
  setChatMessages: (
    value:
      | Array<{ role: MessageRole; content: string }>
      | ((
          prev: Array<{ role: MessageRole; content: string }>,
        ) => Array<{ role: MessageRole; content: string }>),
  ) => void;

  // Actions
  makeAPICall: () => Promise<void>;
}

/**
 * Custom hook for managing Task Demo state and API interactions.
 * Encapsulates all business logic for AI prompt testing interface.
 *
 * @param config - Task configuration containing settings and defaults
 * @param slug - URL slug array for API routing
 * @returns Object containing all state values and actions
 */
export function useTaskDemo({
  config,
  slug,
}: UseTaskDemoParams): UseTaskDemoReturn {
  // Input states
  const [systemMessage, setSystemMessage] = useState<string>(
    config?.systemMessage || "",
  );
  const [prompt, setPrompt] = useState<string>(config?.defaultPrompt || "");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Task 3: Parameters
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);
  const [maxTokens, setMaxTokens] = useState<number>(150);
  const [n, setN] = useState<number>(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number>(0.0);
  const [seed, setSeed] = useState<number | undefined>(undefined);

  // Task 4, 5: Chat messages
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: MessageRole; content: string }>
  >([]);

  /**
   * Makes API call to the learning endpoint with current state.
   * Handles different modes: simple prompt, chat mode, context mode.
   */
  const makeAPICall = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");

    // For non-chat tasks, clear previous response
    if (!config?.isChatMode) {
      setResponse("");
    }

    // For chat mode (Task 4, 5), add user message to history
    if (config?.isChatMode) {
      setChatMessages((prev) => [
        ...prev,
        { role: MessageRole.User, content: prompt },
      ]);
    }

    try {
      const res = await fetch(`/api/learning/${slug.join("/")}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          systemMessage: systemMessage || undefined,
          temperature: config?.hasParameters ? temperature : undefined,
          topP: config?.hasParameters ? topP : undefined,
          maxTokens: config?.hasParameters ? maxTokens : undefined,
          n: config?.hasParameters && n > 1 ? n : undefined,
          frequencyPenalty:
            config?.hasParameters && frequencyPenalty !== 0
              ? frequencyPenalty
              : undefined,
          seed: config?.hasParameters ? seed : undefined,
          // Task 5: Send chat history for context
          chatHistory: config?.hasContext ? chatMessages : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      // For chat mode (Task 4, 5), add assistant message to history
      if (config?.isChatMode) {
        setChatMessages((prev) => [
          ...prev,
          { role: MessageRole.Assistant, content: data.response },
        ]);
        setPrompt(""); // Clear input for next message
      } else {
        setResponse(data.response);
        // Clear input only for tasks without parameters (Task 1, 2)
        if (!config?.hasParameters) {
          setPrompt("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    // Input states
    systemMessage,
    setSystemMessage,
    prompt,
    setPrompt,

    // Response states
    response,
    loading,
    error,

    // Parameter states
    temperature,
    setTemperature,
    topP,
    setTopP,
    maxTokens,
    setMaxTokens,
    n,
    setN,
    frequencyPenalty,
    setFrequencyPenalty,
    seed,
    setSeed,

    // Chat states
    chatMessages,
    setChatMessages,

    // Actions
    makeAPICall,
  };
}
