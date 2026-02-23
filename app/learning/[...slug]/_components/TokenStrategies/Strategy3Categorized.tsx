"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  tokens: number;
  topics: string[]; // Темы сообщения
}

/**
 * Strategy 3: Categorized Excerpts (Категории по темам)
 *
 * Самая продвинутая стратегия:
 * 1. Разбиваем сообщения на темы/категории
 * 2. При новом вопросе определяем релевантные темы
 * 3. Отправляем AI только контекст релевантных тем
 *
 * ✅ Плюсы: Масштабируется лучше всех, AI получает только нужный контекст
 * ❌ Минусы: Сложная реализация, много AI вызовов, нужна хорошая категоризация
 */
export function Strategy3Categorized() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topicDatabase, setTopicDatabase] = useState<Record<string, string[]>>(
    {},
  );
  const TOKEN_LIMIT = 500;

  const countTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  // Симуляция категоризации сообщения
  const categorizeMessage = (content: string): string[] => {
    const keywords = content.toLowerCase();
    const detectedTopics: string[] = [];

    // Простая эвристика для демонстрации
    if (
      keywords.includes("price") ||
      keywords.includes("cost") ||
      keywords.includes("цена")
    )
      detectedTopics.push("pricing");
    if (
      keywords.includes("delivery") ||
      keywords.includes("shipping") ||
      keywords.includes("доставка")
    )
      detectedTopics.push("delivery");
    if (
      keywords.includes("product") ||
      keywords.includes("item") ||
      keywords.includes("товар")
    )
      detectedTopics.push("products");
    if (
      keywords.includes("support") ||
      keywords.includes("help") ||
      keywords.includes("помощь")
    )
      detectedTopics.push("support");
    if (
      keywords.includes("account") ||
      keywords.includes("profile") ||
      keywords.includes("аккаунт")
    )
      detectedTopics.push("account");

    return detectedTopics.length > 0 ? detectedTopics : ["general"];
  };

  // Добавление сообщения в базу тем
  const addToTopicDatabase = (content: string, topics: string[]) => {
    const newDatabase = { ...topicDatabase };

    topics.forEach((topic) => {
      if (!newDatabase[topic]) {
        newDatabase[topic] = [];
      }
      newDatabase[topic].push(content);
    });

    setTopicDatabase(newDatabase);
  };

  // Определение релевантных тем для вопроса
  const getRelevantTopics = (question: string): string[] => {
    return categorizeMessage(question);
  };

  // Получение токенов из релевантных тем
  const getRelevantTokenCount = (relevantTopics: string[]): number => {
    let total = 0;

    relevantTopics.forEach((topic) => {
      if (topicDatabase[topic]) {
        topicDatabase[topic].forEach((excerpt) => {
          total += countTokens(excerpt);
        });
      }
    });

    return total;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);

    // Определяем темы вопроса
    const questionTopics = categorizeMessage(input);

    const userMessage: Message = {
      role: "user",
      content: input,
      tokens: countTokens(input),
      topics: questionTopics,
    };

    // КЛЮЧЕВОЙ МОМЕНТ: Определяем релевантные темы
    const relevantTopics = getRelevantTopics(input);
    const relevantTokens = getRelevantTokenCount(relevantTopics);

    // Добавляем в базу тем
    addToTopicDatabase(input, questionTopics);

    let updatedMessages = [...messages, userMessage];

    // Симуляция ответа AI (с учетом релевантных тем)
    const aiResponse = `AI ответ для тем [${relevantTopics.join(", ")}]: "${input.substring(
      0,
      30,
    )}..." (используя ${relevantTokens} tokens из базы тем)`;

    const aiMessage: Message = {
      role: "assistant",
      content: aiResponse,
      tokens: countTokens(aiResponse),
      topics: questionTopics,
    };

    addToTopicDatabase(aiResponse, questionTopics);
    updatedMessages = [...updatedMessages, aiMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(false);
  };

  const totalMessages = messages.length;
  const totalTopics = Object.keys(topicDatabase).length;
  const topicExcerpts = Object.values(topicDatabase).reduce(
    (sum, excerpts) => sum + excerpts.length,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Strategy 3: Categorized Excerpts 🗂️</span>
          <Badge variant="default">{totalTopics} topics</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Разбивает контекст на темы, отправляет AI только релевантное
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic Database */}
        {Object.keys(topicDatabase).length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">📚 Topic Database:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(topicDatabase).map(([topic, excerpts]) => (
                <Badge key={topic} variant="outline">
                  {topic} ({excerpts.length})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Сообщения */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8 space-y-2">
              <p>Начните диалог чтобы увидеть категоризацию</p>
              <p className="text-xs">
                💡 Попробуйте спросить про: pricing, delivery, products,
                support, account
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-100 dark:bg-blue-900 ml-8"
                    : "bg-gray-100 dark:bg-gray-800 mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {msg.role === "user" ? "👤 You" : "🤖 AI"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {msg.tokens} tokens
                  </Badge>
                </div>
                <p className="text-sm mb-2">{msg.content}</p>
                {/* Topics tags */}
                <div className="flex flex-wrap gap-1">
                  {msg.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      🏷️ {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Статистика */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>📊 Messages:</span>
            <span className="font-semibold">{totalMessages}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🗂️ Topics:</span>
            <span className="font-semibold text-green-600">{totalTopics}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>📝 Excerpts:</span>
            <span className="font-semibold">{topicExcerpts}</span>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about pricing, delivery, products..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "..." : "Send"}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
          <p className="text-xs text-green-800 dark:text-green-300">
            💡 <strong>Как работает:</strong> Каждое сообщение разбивается на
            темы. При новом вопросе определяются релевантные темы и AI получает
            только отрывки из этих тем. Это позволяет работать с огромным
            контекстом, отправляя только нужную информацию.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
