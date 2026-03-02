"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * ========================================
 * STRATEGY 4: HYBRID APPROACH (Гибридный подход)
 * ========================================
 *
 * Это САМАЯ ПРОДВИНУТАЯ стратегия, которая комбинирует все предыдущие подходы:
 *
 * 🔄 Rolling Context (Strategy 1) - удаление самых старых/нерелевантных
 * 🤖 Summarization (Strategy 2) - сжатие через AI
 * 🗂️ Categorization (Strategy 3) - разбивка по темам
 *
 * ========================================
 * КАК ЭТО РАБОТАЕТ (пошагово):
 * ========================================
 *
 * ШАГ 1: CATEGORIZATION (Категоризация)
 * -------------------------------------
 * Каждое новое сообщение категоризуется по темам:
 * - pricing, delivery, products, support, account, general
 *
 * Пример:
 * User: "What's the price of Product X?"
 * → Topics: ["pricing", "products"]
 *
 * ШАГ 2: RELEVANCE SCORING (Оценка релевантности)
 * -------------------------------------
 * Для ТЕКУЩЕГО вопроса определяем релевантность старых сообщений:
 * - Релевантные темы = высокий score
 * - Недавние сообщения = высокий score
 * - Старые + нерелевантные = низкий score
 *
 * Пример:
 * Current question about "pricing" →
 * - Message #2 about "pricing" (3 messages ago) → Score: 8/10
 * - Message #5 about "delivery" (10 messages ago) → Score: 2/10
 *
 * ШАГ 3: PRIORITY TIERS (Уровни приоритета)
 * -------------------------------------
 * Делим сообщения на 3 tier'а:
 *
 * 🔴 TIER 1 (Critical): Последние 3 сообщения + текущий вопрос
 *    → ВСЕГДА отправляем в полном виде
 *
 * 🟡 TIER 2 (Important): Релевантные сообщения (score >= 5)
 *    → Отправляем полностью, если есть место
 *    → Если токенов мало → СЖИМАЕМ через AI
 *
 * ⚪ TIER 3 (Optional): Нерелевантные сообщения (score < 5)
 *    → УДАЛЯЕМ если превышен лимит
 *    → Или сжимаем в краткий summary
 *
 * ШАГ 4: TOKEN BUDGET ALLOCATION (Распределение токенов)
 * -------------------------------------
 * Распределяем лимит токенов по приоритетам:
 * - 60% токенов → Tier 1 (критичные сообщения)
 * - 30% токенов → Tier 2 (релевантные)
 * - 10% токенов → Tier 3 (опциональные)
 *
 * Пример при лимите 1000 токенов:
 * - Tier 1: 600 tokens
 * - Tier 2: 300 tokens
 * - Tier 3: 100 tokens
 *
 * ШАГ 5: DYNAMIC ADJUSTMENT (Динамическая оптимизация)
 * -------------------------------------
 * Если все еще превышен лимит → применяем в порядке:
 *
 * 1. Удаляем Tier 3 сообщения
 * 2. Сжимаем Tier 2 через AI summarization
 * 3. В крайнем случае: сжимаем даже Tier 1 (кроме последних 2)
 *
 * ========================================
 * ПРИМЕР РАБОТЫ:
 * ========================================
 *
 * История 15 сообщений (1200 токенов), лимит = 800:
 *
 * Messages:
 * #1-#10: Разговор о доставке (delivery) - 600 tokens, topics: [delivery]
 * #11-#12: Вопрос о цене (pricing) - 200 tokens, topics: [pricing]
 * #13-#15: Недавние сообщения - 400 tokens, topics: [pricing, products]
 *
 * Current Question: "What payment methods do you accept?"
 * → Detected topics: [account, support]
 *
 * Step 1: Relevance Scoring
 * #1-#10 (delivery): score = 2/10 (старые, не релевантные)
 * #11-#12 (pricing): score = 4/10 (средние, чуть релевантные)
 * #13-#15 (recent): score = 10/10 (последние 3 - всегда важны)
 *
 * Step 2: Apply Tiers
 * Tier 1: #13-#15 (400 tokens) ← KEEP FULL
 * Tier 2: #11-#12 (200 tokens) ← KEEP if space, else SUMMARIZE
 * Tier 3: #1-#10 (600 tokens) ← DELETE or SUMMARIZE
 *
 * Step 3: Optimize to 800 limit
 * - Keep Tier 1: 400 tokens
 * - Keep Tier 2: 200 tokens
 * - Summarize Tier 3: 600 → 100 tokens (AI summary: "User asked about delivery times and shipping costs")
 *
 * Result: 400 + 200 + 100 = 700 tokens ✅ (under 800 limit)
 *
 * ========================================
 * ПРЕИМУЩЕСТВА HYBRID ПОДХОДА:
 * ========================================
 *
 * ✅ Сохраняет важный контекст (Tier 1 всегда полный)
 * ✅ Масштабируется для огромных историй (Tier 3 удаляется)
 * ✅ Умная приоритизация (релевантность + recency)
 * ✅ Эффективное использование токенов (сжатие где возможно)
 * ✅ Production-ready (GitHub Copilot использует это!)
 *
 * ========================================
 * НЕДОСТАТКИ:
 * ========================================
 *
 * ❌ Самая сложная реализация (много логики)
 * ❌ Больше API вызовов (summarization + categorization)
 * ❌ Требует тщательной настройки (% для tiers, scoring weights)
 * ❌ Сложнее дебажить (много moving parts)
 *
 * ========================================
 * КОГДА ИСПОЛЬЗОВАТЬ:
 * ========================================
 *
 * ✅ Production chatbots с длинными историями
 * ✅ Multi-topic разговоры (support, sales, technical)
 * ✅ Когда важно сохранить максимум контекста
 * ✅ Когда бюджет позволяет дополнительные API calls
 *
 * ❌ Простые чат-боты (overkill)
 * ❌ Короткие разговоры (не нужна оптимизация)
 * ❌ Tight budget (много API вызовов = дорого)
 */

interface Message {
  role: "user" | "assistant";
  content: string;
  tokens: number;
  topics: string[];
  timestamp: number;
  relevanceScore?: number; // 0-10 (calculated dynamically)
  tier?: 1 | 2 | 3; // Priority tier
  isSummarized?: boolean;
  summary?: string;
}

const TOKEN_LIMIT = 800; // Средний лимит для демонстрации

// Tier budget allocation (в процентах от лимита)
const TIER_BUDGETS = {
  tier1: 0.6, // 60% для критичных
  tier2: 0.3, // 30% для релевантных
  tier3: 0.1, // 10% для опциональных
};

export function Strategy4Hybrid() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  // Simplified token counting
  const countTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const getTotalTokens = (msgs: Message[]): number => {
    return msgs.reduce((sum, m) => sum + m.tokens, 0);
  };

  // Step 1: Categorize message by keywords
  const categorizeMessage = (content: string): string[] => {
    const keywords = content.toLowerCase();
    const detectedTopics: string[] = [];

    if (
      keywords.includes("price") ||
      keywords.includes("cost") ||
      keywords.includes("payment")
    )
      detectedTopics.push("pricing");
    if (keywords.includes("delivery") || keywords.includes("shipping"))
      detectedTopics.push("delivery");
    if (keywords.includes("product") || keywords.includes("item"))
      detectedTopics.push("products");
    if (
      keywords.includes("support") ||
      keywords.includes("help") ||
      keywords.includes("problem")
    )
      detectedTopics.push("support");
    if (
      keywords.includes("account") ||
      keywords.includes("profile") ||
      keywords.includes("login")
    )
      detectedTopics.push("account");

    return detectedTopics.length > 0 ? detectedTopics : ["general"];
  };

  // Step 2: Calculate relevance score (0-10)
  const calculateRelevanceScore = (
    message: Message,
    currentTopics: string[],
    messageIndex: number,
    totalMessages: number,
  ): number => {
    let score = 0;

    // Recency score (0-5 points)
    // Последние сообщения важнее
    const recencyScore = (messageIndex / totalMessages) * 5;
    score += recencyScore;

    // Topic relevance score (0-5 points)
    // Совпадение тем с текущим вопросом
    const topicOverlap = message.topics.filter((t) =>
      currentTopics.includes(t),
    ).length;
    const topicScore = Math.min((topicOverlap / currentTopics.length) * 5, 5);
    score += topicScore;

    return Math.round(score * 10) / 10; // Round to 1 decimal
  };

  // Step 3: Assign tier based on score and recency
  const assignTier = (
    message: Message,
    index: number,
    total: number,
  ): 1 | 2 | 3 => {
    // Last 3 messages = always Tier 1
    if (index >= total - 3) return 1;

    // High relevance = Tier 2
    if (message.relevanceScore! >= 5) return 2;

    // Low relevance = Tier 3
    return 3;
  };

  // Step 4: Summarize message (simulated AI call)
  const summarizeMessage = async (message: Message): Promise<Message> => {
    // В production: вызов OpenAI API для summarization
    await new Promise((resolve) => setTimeout(resolve, 300));

    const summary = `[Кратко] ${message.content.substring(0, 40)}...`;

    return {
      ...message,
      summary,
      isSummarized: true,
      tokens: countTokens(summary),
      relevanceScore: message.relevanceScore || 0, // Preserve score
    };
  };

  // Step 5: Optimize messages to fit token limit (MAIN ALGORITHM)
  const optimizeMessages = async (
    msgs: Message[],
    currentTopics: string[],
  ): Promise<Message[]> => {
    setOptimizing(true);

    // Calculate relevance scores
    let optimized = msgs.map((msg, idx) => ({
      ...msg,
      relevanceScore: calculateRelevanceScore(
        msg,
        currentTopics,
        idx,
        msgs.length,
      ),
    }));

    // Assign tiers
    optimized = optimized.map((msg, idx) => ({
      ...msg,
      tier: assignTier(msg, idx, optimized.length),
    }));

    let totalTokens = getTotalTokens(optimized);

    // If under limit, no optimization needed
    if (totalTokens <= TOKEN_LIMIT) {
      setOptimizing(false);
      return optimized;
    }

    console.log("🔧 HYBRID OPTIMIZATION START");
    console.log(`Total: ${totalTokens} tokens, Limit: ${TOKEN_LIMIT}`);

    // PHASE 1: Delete Tier 3 (lowest priority)
    const tier3Messages = optimized.filter((m) => m.tier === 3);
    if (tier3Messages.length > 0 && totalTokens > TOKEN_LIMIT) {
      console.log(
        `🗑️ Phase 1: Deleting ${tier3Messages.length} Tier 3 messages`,
      );
      optimized = optimized.filter((m) => m.tier !== 3);
      totalTokens = getTotalTokens(optimized);
    }

    // PHASE 2: Summarize Tier 2 if still over limit
    if (totalTokens > TOKEN_LIMIT) {
      console.log("✂️ Phase 2: Summarizing Tier 2 messages");
      for (let i = 0; i < optimized.length; i++) {
        if (optimized[i].tier === 2 && !optimized[i].isSummarized) {
          const summarized = await summarizeMessage(optimized[i]);
          optimized[i] = {
            ...summarized,
            relevanceScore: optimized[i].relevanceScore,
          };
          totalTokens = getTotalTokens(optimized);

          if (totalTokens <= TOKEN_LIMIT) break;
        }
      }
    }

    // PHASE 3: Summarize older Tier 1 (keep last 2 full)
    if (totalTokens > TOKEN_LIMIT) {
      console.log("⚠️ Phase 3: Summarizing older Tier 1 (emergency)");
      const tier1Messages = optimized.filter((m) => m.tier === 1);
      const tier1ToSummarize = tier1Messages.slice(0, -2); // Keep last 2 full

      for (let i = 0; i < optimized.length; i++) {
        if (
          tier1ToSummarize.includes(optimized[i]) &&
          !optimized[i].isSummarized
        ) {
          const summarized = await summarizeMessage(optimized[i]);
          optimized[i] = {
            ...summarized,
            relevanceScore: optimized[i].relevanceScore,
          };
          totalTokens = getTotalTokens(optimized);

          if (totalTokens <= TOKEN_LIMIT) break;
        }
      }
    }

    console.log(`✅ OPTIMIZATION COMPLETE: ${totalTokens} tokens`);
    setOptimizing(false);
    return optimized;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);

    const currentTopics = categorizeMessage(input);

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      tokens: countTokens(input),
      topics: currentTopics,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];

    // Optimize messages using hybrid approach
    const optimizedMessages = await optimizeMessages(
      updatedMessages,
      currentTopics,
    );

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 500));

    const aiResponse = `[AI Response to topics: ${currentTopics.join(", ")}] This is a simulated response.`;
    const aiMessage: Message = {
      role: "assistant",
      content: aiResponse,
      tokens: countTokens(aiResponse),
      topics: currentTopics,
      timestamp: Date.now(),
    };

    setMessages([...optimizedMessages, aiMessage]);
    setInput("");
    setLoading(false);
  };

  const totalTokens = getTotalTokens(messages);
  const tier1Count = messages.filter((m) => m.tier === 1).length;
  const tier2Count = messages.filter((m) => m.tier === 2).length;
  const tier3Count = messages.filter((m) => m.tier === 3).length;
  const summarizedCount = messages.filter((m) => m.isSummarized).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🧩 Strategy 4: Hybrid Approach</span>
          <div className="flex gap-2">
            <Badge
              variant={totalTokens > TOKEN_LIMIT ? "destructive" : "default"}
            >
              {totalTokens} / {TOKEN_LIMIT} tokens
            </Badge>
            {optimizing && <Badge variant="outline">🔧 Optimizing...</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Panel */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold mb-2 text-purple-900 dark:text-purple-300">
            🧩 Hybrid Approach = Самая умная стратегия
          </h3>
          <p className="text-sm text-purple-800 dark:text-purple-400 mb-2">
            Комбинирует все подходы: Categories (темы) + Summarization (сжатие)
            + Rolling Context (удаление). Делит сообщения на Tier 1 (критичные),
            Tier 2 (релевантные), Tier 3 (опциональные).
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-500">
            💡 GitHub Copilot использует именно этот подход!
          </p>
        </div>

        {/* Tier Distribution */}
        {messages.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                🔴 Tier 1 (Critical)
              </p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {tier1Count}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                Последние + важные (всегда полные)
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                🟡 Tier 2 (Important)
              </p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {tier2Count}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                Релевантные (сжимаем если нужно)
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                ⚪ Tier 3 (Optional)
              </p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {tier3Count}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-500">
                Нерелевантные (удаляем первыми)
              </p>
            </div>
          </div>
        )}

        {/* Message History */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {msg.role === "user" ? "👤 You" : "🤖 AI"}
                  </span>
                  {msg.tier && (
                    <Badge
                      variant="outline"
                      className={
                        msg.tier === 1
                          ? "bg-red-100 dark:bg-red-950"
                          : msg.tier === 2
                            ? "bg-yellow-100 dark:bg-yellow-950"
                            : "bg-gray-100 dark:bg-gray-800"
                      }
                    >
                      Tier {msg.tier}
                    </Badge>
                  )}
                  {msg.relevanceScore !== undefined && (
                    <Badge variant="secondary">
                      Score: {msg.relevanceScore}/10
                    </Badge>
                  )}
                  {msg.isSummarized && (
                    <Badge variant="default">✂️ Сжато</Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {msg.tokens} tokens
                </span>
              </div>
              <p className="text-sm">
                {msg.isSummarized && msg.summary ? msg.summary : msg.content}
              </p>
              <div className="flex gap-1 mt-2">
                {msg.topics.map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    🏷️ {topic}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Спроси о pricing, delivery, products..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            disabled={loading || optimizing}
          />
          <Button onClick={handleSend} disabled={loading || optimizing}>
            {loading ? "⏳" : optimizing ? "🔧" : "Send"}
          </Button>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">📊 Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Total Messages:
              </span>
              <span className="ml-2 font-semibold">{messages.length}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Total Tokens:
              </span>
              <span className="ml-2 font-semibold">{totalTokens}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Summarized:
              </span>
              <span className="ml-2 font-semibold">{summarizedCount}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="ml-2 font-semibold">
                {totalTokens <= TOKEN_LIMIT
                  ? "✅ Under limit"
                  : "⚠️ Over limit"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
