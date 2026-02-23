"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { countTokens } from "@/lib/tokenUtils";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  tokens: number;
  summary?: string;
  isSummarized: boolean;
}

const SYSTEM_MESSAGE: Message = {
  role: "system",
  content: "You are a helpful travel assistant.",
  tokens: countTokens("You are a helpful travel assistant."),
  isSummarized: false,
};

/**
 * Strategy 2: Summarized Message History - PRODUCTION VERSION
 *
 * ✅ Улучшения:
 * - Точный подсчет токенов через js-tiktoken
 * - Настоящие API вызовы для summarization
 * - Защита системного сообщения
 * - Настоящие AI ответы
 *
 * ✅ Плюсы: Сохраняем суть старого контекста, AI помнит историю
 * ❌ Минусы: Дополнительные API вызовы, медленнее, может потерять детали
 */
export function Strategy2Summarized() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");
  const TOKEN_LIMIT = 500;

  const getTotalTokens = (msgs: Message[]): number => {
    return msgs.reduce((sum, msg) => {
      const content =
        msg.isSummarized && msg.summary ? msg.summary : msg.content;
      return sum + countTokens(content);
    }, 0);
  };

  // Настоящая summarization через OpenAI API
  const summarizeMessage = async (message: Message): Promise<Message> => {
    try {
      const response = await fetch("/app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Summarize the following message in 1-2 short sentences, keeping key information:",
            },
            {
              role: "user",
              content: `${message.role}: ${message.content}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("Summarization failed");

      const data = await response.json();
      const summary = data.message || message.content.substring(0, 50) + "...";

      return {
        ...message,
        summary,
        isSummarized: true,
        tokens: countTokens(summary),
      };
    } catch (error) {
      console.error("Summarization error:", error);
      // Fallback: простое обрезание
      const summary = message.content.substring(0, 50) + "...";
      return {
        ...message,
        summary,
        isSummarized: true,
        tokens: countTokens(summary),
      };
    }
  };

  // Сжимаем старые сообщения (кроме system)
  const summarizeOldMessages = async (msgs: Message[]): Promise<Message[]> => {
    setSummarizing(true);
    const updatedMessages = [...msgs];
    let totalTokens = getTotalTokens(updatedMessages);

    // Начинаем с индекса 1 (пропускаем system), оставляем последние 3
    for (
      let i = 1;
      i < updatedMessages.length - 3 && totalTokens > TOKEN_LIMIT;
      i++
    ) {
      if (!updatedMessages[i].isSummarized) {
        console.log(`🤖 Summarizing message ${i}...`);
        updatedMessages[i] = await summarizeMessage(updatedMessages[i]);
        totalTokens = getTotalTokens(updatedMessages);
      }
    }

    setSummarizing(false);
    return updatedMessages;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const userMessage: Message = {
        role: "user",
        content: input,
        tokens: countTokens(input),
        isSummarized: false,
      };

      let updatedMessages = [...messages, userMessage];

      // Сжимаем ПЕРЕД API вызовом если нужно
      if (getTotalTokens(updatedMessages) > TOKEN_LIMIT) {
        updatedMessages = await summarizeOldMessages(updatedMessages);
      }

      // Настоящий API вызов
      const response = await fetch("/app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content:
              m.isSummarized && m.summary
                ? `[Summary: ${m.summary}]`
                : m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const aiResponse = data.message || "No response";

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponse,
        tokens: countTokens(aiResponse),
        isSummarized: false,
      };

      updatedMessages = [...updatedMessages, aiMessage];

      // Сжимаем снова после ответа если нужно
      if (getTotalTokens(updatedMessages) > TOKEN_LIMIT) {
        updatedMessages = await summarizeOldMessages(updatedMessages);
      }

      setMessages(updatedMessages);
      setInput("");
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const totalTokens = getTotalTokens(messages);
  const summarizedCount = messages.filter((m) => m.isSummarized).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Strategy 2: Summarized History 🤖</span>
          <Badge
            variant={totalTokens > TOKEN_LIMIT ? "destructive" : "default"}
          >
            {totalTokens} / {TOKEN_LIMIT} tokens
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          AI сжимает старые сообщения через OpenAI API (production version)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              ❌ <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Индикатор summarization */}
        {summarizing && (
          <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-center">
            <span className="text-sm text-yellow-800 dark:text-yellow-300">
              🤖 AI сжимает старые сообщения через OpenAI...
            </span>
          </div>
        )}

        {/* Сообщения */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.length === 1 ? (
            <p className="text-center text-gray-500 py-8">
              Начните диалог чтобы увидеть сжатие сообщений
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.role === "system"
                    ? "bg-purple-100 dark:bg-purple-900 border-2 border-purple-300"
                    : msg.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900 ml-8"
                      : "bg-gray-100 dark:bg-gray-800 mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {msg.role === "system"
                      ? "⚙️ System"
                      : msg.role === "user"
                        ? "👤 You"
                        : "🤖 AI"}
                  </span>
                  <div className="flex gap-1">
                    {msg.isSummarized && (
                      <Badge variant="secondary" className="text-xs">
                        ✂️ Summarized
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {countTokens(
                        msg.isSummarized && msg.summary
                          ? msg.summary
                          : msg.content,
                      )}{" "}
                      tokens
                    </Badge>
                  </div>
                </div>
                <p className="text-sm">
                  {msg.isSummarized && msg.summary ? msg.summary : msg.content}
                </p>
                {msg.isSummarized && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Show original
                    </summary>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {msg.content}
                    </p>
                  </details>
                )}
              </div>
            ))
          )}
        </div>

        {/* Статистика */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>📊 Messages:</span>
            <span className="font-semibold">{messages.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>✂️ Summarized:</span>
            <span className="font-semibold text-blue-600">
              {summarizedCount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🎯 Total Tokens:</span>
            <span className="font-semibold">{totalTokens}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🛡️ System Protected:</span>
            <span className="font-semibold text-green-600">Yes</span>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && !summarizing && handleSend()
            }
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            disabled={loading || summarizing}
          />
          <Button onClick={handleSend} disabled={loading || summarizing}>
            {loading || summarizing ? "⏳" : "Send"}
          </Button>
        </div>

        {/* Info - Updated */}
        <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
          <p className="text-xs text-purple-800 dark:text-purple-300">
            💡 <strong>Production Version:</strong> Использует OpenAI API для
            настоящего сжатия сообщений. js-tiktoken для точного подсчета
            токенов. Системное сообщение защищено. Последние 3 сообщения
            сохраняются полными.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
