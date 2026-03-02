"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Strategy1RollingContext } from "./TokenStrategies/Strategy1RollingContext";
import { Strategy2Summarized } from "./TokenStrategies/Strategy2Summarized";
import { Strategy3Categorized } from "./TokenStrategies/Strategy3Categorized";
import { Strategy4Hybrid } from "./TokenStrategies/Strategy4Hybrid";

/**
 * Task 6: Token Limits Management
 *
 * Демонстрация 4 стратегий управления токенами:
 * 1. Rolling Context - удаление старых сообщений
 * 2. Summarized History - сжатие через AI
 * 3. Categorized Excerpts - категоризация по темам
 * 4. Hybrid Approach - комбинация всех подходов (Production-ready)
 */

type Strategy = "rolling" | "summarized" | "categorized" | "hybrid";

interface StrategyInfo {
  id: Strategy;
  name: string;
  emoji: string;
  description: string;
  pros: string[];
  cons: string[];
  complexity: number; // 1-3
  performance: number; // 1-3
  contextPreservation: number; // 1-3
}

const strategies: StrategyInfo[] = [
  {
    id: "rolling",
    name: "Rolling Context",
    emoji: "🔄",
    description: "Удаляем самые старые сообщения когда превышен лимит токенов",
    pros: [
      "Самая простая реализация",
      "Быстрая (без дополнительных AI вызовов)",
      "Нет дополнительных затрат",
    ],
    cons: [
      "Полная потеря старого контекста",
      "AI забывает ранние сообщения",
      "Не подходит для длинных диалогов",
    ],
    complexity: 1,
    performance: 3,
    contextPreservation: 1,
  },
  {
    id: "summarized",
    name: "Summarized History",
    emoji: "🤖",
    description: "AI сжимает старые сообщения в краткие summary",
    pros: [
      "Сохраняет суть старого контекста",
      "AI помнит историю в сжатом виде",
      "Баланс между памятью и размером",
    ],
    cons: [
      "Дополнительные API вызовы (затраты)",
      "Медленнее из-за summarization",
      "Может потерять важные детали",
    ],
    complexity: 2,
    performance: 2,
    contextPreservation: 2,
  },
  {
    id: "categorized",
    name: "Categorized Excerpts",
    emoji: "🗂️",
    description: "Разбиваем на темы, отправляем только релевантные",
    pros: [
      "Масштабируется для огромных историй",
      "AI получает только нужный контекст",
      "Эффективное использование токенов",
    ],
    cons: [
      "Самая сложная реализация",
      "Много AI вызовов для категоризации",
      "Нужна хорошая система тегирования",
    ],
    complexity: 3,
    performance: 1,
    contextPreservation: 3,
  },
  {
    id: "hybrid",
    name: "Hybrid Approach",
    emoji: "🧩",
    description: "Комбинация всех подходов: категории + сжатие + приоритеты",
    pros: [
      "Production-ready (GitHub Copilot использует это!)",
      "Умная приоритизация (Tier 1/2/3)",
      "Сохраняет важный контекст + масштабируется",
    ],
    cons: [
      "Самая сложная реализация (много логики)",
      "Больше API вызовов (дороже)",
      "Требует тщательной настройки",
    ],
    complexity: 3,
    performance: 2,
    contextPreservation: 3,
  },
];

export function Task6TokenLimits() {
  const [activeStrategy, setActiveStrategy] = useState<Strategy>("rolling");

  const currentStrategy = strategies.find((s) => s.id === activeStrategy)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            🎯 Task 6: Token Limits Management
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Изучи 4 стратегии управления токенами для чат-ботов
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📚 Что такое Token Limits?</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              OpenAI модели имеют ограничение на количество токенов (примерно 1
              токен ≈ 0.75 слова). Например, <code>gpt-4</code> имеет лимит
              8,192 токена.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Проблема: в чат-боте с длинной историей легко превысить лимит →
              нужны стратегии управления контекстом.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Выбери стратегию:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setActiveStrategy(strategy.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  activeStrategy === strategy.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{strategy.emoji}</span>
                  {activeStrategy === strategy.id && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{strategy.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {strategy.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStrategy.emoji} {currentStrategy.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Сложность:
              </p>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded ${
                      i < currentStrategy.complexity
                        ? "bg-red-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Производительность:
              </p>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded ${
                      i < currentStrategy.performance
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Сохранение контекста:
              </p>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded ${
                      i < currentStrategy.contextPreservation
                        ? "bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                ✅ Плюсы:
              </h4>
              <ul className="space-y-1">
                {currentStrategy.pros.map((pro, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-green-700 dark:text-green-400"
                  >
                    • {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                ❌ Минусы:
              </h4>
              <ul className="space-y-1">
                {currentStrategy.cons.map((con, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-red-700 dark:text-red-400"
                  >
                    • {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <div>
        {activeStrategy === "rolling" && <Strategy1RollingContext />}
        {activeStrategy === "summarized" && <Strategy2Summarized />}
        {activeStrategy === "categorized" && <Strategy3Categorized />}
        {activeStrategy === "hybrid" && <Strategy4Hybrid />}
      </div>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Comparison Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-2">Strategy</th>
                  <th className="text-center p-2">Complexity</th>
                  <th className="text-center p-2">Performance</th>
                  <th className="text-center p-2">Context</th>
                  <th className="text-left p-2">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b dark:border-gray-700">
                  <td className="p-2">
                    <strong>Rolling Context</strong>
                  </td>
                  <td className="text-center p-2">⭐</td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="text-center p-2">⭐</td>
                  <td className="p-2 text-xs">
                    Short chats, not critical old context
                  </td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="p-2">
                    <strong>Summarized</strong>
                  </td>
                  <td className="text-center p-2">⭐⭐</td>
                  <td className="text-center p-2">⭐⭐</td>
                  <td className="text-center p-2">⭐⭐</td>
                  <td className="p-2 text-xs">
                    Important to keep full context
                  </td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="p-2">
                    <strong>Categorized</strong>
                  </td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="text-center p-2">⭐</td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="p-2 text-xs">Huge histories, many topics</td>
                </tr>
                <tr>
                  <td className="p-2">
                    <strong>🧩 Hybrid</strong>
                  </td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="p-2 text-xs">
                    Production apps (best overall)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href="https://platform.openai.com/docs/guides/text-generation/managing-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <p className="font-semibold text-sm">📖 OpenAI: Managing Tokens</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Official documentation on token management
            </p>
          </a>
          <a
            href="https://github.com/openai/tiktoken"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <p className="font-semibold text-sm">🔧 Tiktoken Library</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Token counting library for OpenAI models
            </p>
          </a>
          <a
            href="https://platform.openai.com/docs/models/gpt-4"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <p className="font-semibold text-sm">🤖 Model Token Limits</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Check token limits for different OpenAI models
            </p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
