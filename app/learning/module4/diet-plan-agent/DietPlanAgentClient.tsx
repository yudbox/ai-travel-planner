"use client";

import React, { useState, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Recipe {
  id: number;
  title: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

interface SimilarPlan {
  id: string;
  dietType: string;
  goal: string;
  restrictions: string[];
  similarity: number;
  usageCount: number;
}

interface DietPlanState {
  dietType?: string;
  goal?: string;
  restrictions?: string[];
  recipesCount: number;
  similarPlansCount: number;
  hasPlan: boolean;
}

export default function DietPlanAgentClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Welcome! I'm your Diet Plan Agent. Tell me about your dietary preferences (e.g., 'I want a vegan diet for weight loss, no nuts or dairy').",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<DietPlanState | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [similarPlans, setSimilarPlans] = useState<SimilarPlan[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Timer effect - updates every second when loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (loading && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, startTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    // Reset state for new request to prevent showing old data
    setState(null);
    setRecipes([]);
    setSimilarPlans([]);
    setGeneratedPlan(null);
    setElapsedTime(0);
    setStartTime(Date.now());

    try {
      const response = await fetch("/api/learning/module4-task1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          threadId: "diet-plan-demo",
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "node") {
              // Update state and data (merge, don't replace)
              setState((prev) => ({
                ...prev,
                dietType: data.state.dietType || prev?.dietType,
                goal: data.state.goal || prev?.goal,
                restrictions:
                  data.state.restrictions || prev?.restrictions || [],
                recipesCount:
                  data.state.recipesCount || prev?.recipesCount || 0,
                similarPlansCount:
                  data.state.similarPlansCount || prev?.similarPlansCount || 0,
                hasPlan: data.state.hasPlan || prev?.hasPlan || false,
              }));
              if (data.recipes?.length > 0) {
                setRecipes(data.recipes);
              }
              if (data.similarPlans?.length > 0) {
                setSimilarPlans(data.similarPlans);
              }
              if (data.plan) {
                setGeneratedPlan(data.plan);
              }

              console.log(`✅ NODE UPDATE: ${data.node}`, {
                state: data.state,
              });
            } else if (data.type === "done") {
              // Final update

              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: data.response,
                },
              ]);

              // Final state update (merge, don't replace)
              setState((prev) => ({
                ...prev,
                dietType: data.state.dietType || prev?.dietType,
                goal: data.state.goal || prev?.goal,
                restrictions:
                  data.state.restrictions || prev?.restrictions || [],
                recipesCount:
                  data.state.recipesCount || prev?.recipesCount || 0,
                similarPlansCount:
                  data.state.similarPlansCount || prev?.similarPlansCount || 0,
                hasPlan: data.state.hasPlan || prev?.hasPlan || false,
              }));
              if (data.recipes?.length > 0) {
                setRecipes(data.recipes);
              }
              if (data.similarPlans?.length > 0) {
                setSimilarPlans(data.similarPlans);
              }
              if (data.plan) {
                setGeneratedPlan(data.plan);
              }

              console.log("✅ STREAMING COMPLETED");
            } else if (data.type === "error") {
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: `❌ Error: ${data.error}`,
                },
              ]);
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
      setStartTime(null);
      // Don't reset progress to prevent CLS - keep it at 100% to show completion
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Left Side */}
        <div className="space-y-6">
          {/* Current State */}
          <div className="bg-white rounded-xl shadow-lg border p-6 min-h-[280px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🧠 Agent State
            </h2>
            {state ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Diet Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {state.dietType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Goal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {state.goal || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Restrictions
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {state.restrictions && state.restrictions.length > 0
                      ? state.restrictions.join(", ")
                      : "None"}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 uppercase">
                    Data Retrieved
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      📦 Recipes: {state.recipesCount}
                    </p>
                    <p className="text-sm text-gray-700">
                      🔍 Similar Plans: {state.similarPlansCount}
                    </p>
                    <p className="text-sm text-gray-700">
                      📋 Plan Generated:{" "}
                      {state.hasPlan ? "✅ Yes" : "⏳ Not yet"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No data yet. Start a conversation!
              </p>
            )}
          </div>

          {/* Recipe Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6 min-h-[350px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📦 Found Recipes
            </h2>
            {loading && recipes.length === 0 ? (
              <div className="flex items-center justify-center py-4 min-h-[250px]">
                <div className="text-sm text-gray-500">
                  🔍 Searching recipes...
                </div>
              </div>
            ) : recipes.length > 0 ? (
              <div className="space-y-2 h-[300px] overflow-y-auto">
                {recipes.slice(0, 10).map((recipe, idx) => (
                  <div
                    key={`recipe-${recipe.id}-${idx}`}
                    onClick={() => {
                      if (recipe.sourceUrl) {
                        window.open(recipe.sourceUrl, "_blank");
                      }
                    }}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer border border-transparent"
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {idx + 1}. {recipe.title} 🔗
                    </p>
                    {recipe.readyInMinutes && (
                      <p className="text-xs text-gray-600 mt-1">
                        ⏱️ {recipe.readyInMinutes} min
                        {recipe.servings && ` • 🍽️ ${recipe.servings} servings`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 min-h-[250px] flex items-center justify-center">
                No recipes yet. Agent will search after extracting preferences.
              </div>
            )}
          </div>

          {/* Memory Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6 min-h-[280px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🔍 Similar Plans
            </h2>
            {loading && similarPlans.length === 0 ? (
              <div className="flex items-center justify-center py-4 min-h-[180px]">
                <div className="text-sm text-gray-500">
                  🔍 Searching database...
                </div>
              </div>
            ) : similarPlans.length > 0 ? (
              <div className="space-y-3 min-h-[180px]">
                {similarPlans.map((plan, idx) => (
                  <div
                    key={`plan-${plan.id}-${idx}`}
                    className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-purple-700">
                        {idx + 1}️⃣
                      </span>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-purple-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.round(plan.similarity * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-purple-700">
                        {Math.round(plan.similarity * 100)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {plan.dietType} • {plan.goal}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Used {plan.usageCount}{" "}
                      {plan.usageCount === 1 ? "time" : "times"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 min-h-[180px] flex items-center justify-center">
                💡 No similar plans found yet. Your plan will be unique!
              </div>
            )}
          </div>

          {/* Session Stats */}
          <div className="bg-white rounded-xl shadow-lg border p-6 min-h-[220px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Session Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">⏱️ Time:</span>
                <span className="text-sm font-mono font-medium text-gray-900">
                  {Math.floor(elapsedTime / 60)}:
                  {String(elapsedTime % 60).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">🍳 Recipes:</span>
                <span className="text-sm font-medium text-gray-900">
                  {state?.recipesCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">🧠 Memory:</span>
                <span className="text-sm font-medium text-gray-900">
                  {state?.similarPlansCount || 0} matches
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">✨ Quality:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {state?.hasPlan
                      ? "Excellent"
                      : state?.recipesCount
                        ? "Good"
                        : "Waiting"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        state?.hasPlan ? 100 : state?.recipesCount ? 60 : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Try saying:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• "I want a vegan diet for weight loss"</li>
              <li>• "Keto diet for muscle gain, no dairy"</li>
              <li>• "Paleo diet for maintenance"</li>
            </ul>
          </div>
        </div>

        {/* Chat Interface - Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <div className="bg-white rounded-xl shadow-lg border p-6 h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your dietary preferences..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </form>
          </div>

          {/* Generated Plan */}
          {generatedPlan && (
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Your 7-Day Diet Plan
              </h2>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {generatedPlan}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
