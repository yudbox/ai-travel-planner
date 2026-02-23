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
}

const SYSTEM_MESSAGE: Message = {
  role: "system",
  content: "You are a helpful travel assistant.",
  tokens: countTokens("You are a helpful travel assistant."),
};

/**
 * Strategy 1: Rolling Context (Скользящее окно) - PRODUCTION VERSION
 *
 * ✅ Улучшения:
 * - Точный подсчет токенов через js-tiktoken (как в OpenAI)
 * - Защита системного сообщения (никогда не удаляется)
 * - Настоящие API вызовы к OpenAI
 * - Корректная логика удаления (с индекса 1, пропуская system)
 *
 * ✅ Плюсы: Простая, быстрая, без доп. API вызовов
 * ❌ Минусы: Теряем старый контекст полностью
 */
export function Strategy1RollingContext() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const TOKEN_LIMIT = 500; // Низкий лимит для демонстрации

  const getTotalTokens = (msgs: Message[]): number => {
    return msgs.reduce((sum, msg) => sum + msg.tokens, 0);
  };

  // Удаление старых сообщений при превышении лимита (PRODUCTION VERSION)
  // ВАЖНО: Всегда сохраняем системное сообщение (индекс 0)
  const trimMessages = (msgs: Message[]): Message[] => {
    const result = [...msgs];
    let totalTokens = getTotalTokens(result);

    // Удаляем с индекса 1 (после system message)
    while (totalTokens > TOKEN_LIMIT && result.length > 1) {
      if (result.length === 1) break; // Оставляем только system message

      const removed = result.splice(1, 1)[0]; // Удаляем ВТОРОЕ (сохраняя system)
      totalTokens -= removed.tokens;
      console.log(
        `🗑️ Removed message at index 1 (${removed.role}: ${removed.tokens} tokens)`,
      );
    }

    console.log(`✅ Final token count after trimming: ${totalTokens}`);
    return result;
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
      };

      // Добавляем сообщение пользователя
      let updatedMessages = [...messages, userMessage];

      // Обрезаем ПЕРЕД API вызовом
      updatedMessages = trimMessages(updatedMessages);

      // Настоящий API вызов к OpenAI
      const response = await fetch("/app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.message || "No response";

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponse,
        tokens: countTokens(aiResponse),
      };

      updatedMessages = [...updatedMessages, aiMessage];

      // Обрезаем снова после добавления ответа AI
      updatedMessages = trimMessages(updatedMessages);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Strategy 1: Rolling Context 🔄</span>
          <Badge
            variant={totalTokens > TOKEN_LIMIT ? "destructive" : "default"}
          >
            {totalTokens} / {TOKEN_LIMIT} tokens
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Удаляем самые старые сообщения (кроме system) когда превышен лимит
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

        {/* Сообщения */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.length === 1 ? (
            <p className="text-center text-gray-500 py-8">
              Начните диалог чтобы увидеть как работает стратегия
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
                  <Badge variant="outline" className="text-xs">
                    {msg.tokens} tokens
                  </Badge>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Статистика */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>📊 Messages:</span>
            <span className="font-semibold">
              {messages.length} (including system)
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
          <div className="flex justify-between text-sm">
            <span>⚠️ Trimmed:</span>
            <span className="font-semibold text-red-600">
              {totalTokens > TOKEN_LIMIT ? "Active" : "No"}
            </span>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "⏳" : "Send"}
          </Button>
        </div>

        {/* Info - Updated */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 <strong>Production Version:</strong> Использует js-tiktoken для
            точного подсчета токенов. Системное сообщение защищено от удаления.
            Удаляются сообщения с индекса 1 (после system). Настоящие API вызовы
            к OpenAI.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
