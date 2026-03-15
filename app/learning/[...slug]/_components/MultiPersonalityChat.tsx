"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  type: "user" | "assistant";
  content: string;
  mode?: string;
  modeEmoji?: string;
}

interface ChainStep {
  name: string;
  description: string;
  emoji: string;
}

const AI_MODES = [
  {
    id: "travelGuide",
    name: "Travel Guide",
    emoji: "🗺️",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "budgetAdvisor",
    name: "Budget Advisor",
    emoji: "💰",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "adventurePlanner",
    name: "Adventure Planner",
    emoji: "🏔️",
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "foodExpert",
    name: "Food & Culture Expert",
    emoji: "🍷",
    color: "bg-purple-100 text-purple-800",
  },
];

export function MultiPersonalityChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState("travelGuide");
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [messageCount, setMessageCount] = useState(0);
  const [chainSteps, setChainSteps] = useState<ChainStep[]>([]);
  const [showChain, setShowChain] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/learning/module3-task1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          mode: selectedMode,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: data.response,
          mode: data.mode,
          modeEmoji: data.modeEmoji,
        },
      ]);
      setMessageCount(data.messageCount);
      setChainSteps(data.chainVisualization.steps);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await fetch("/api/learning/module3-task1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", sessionId }),
      });
      setMessages([]);
      setMessageCount(0);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/learning/module3-task1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export", sessionId }),
      });
      const data = await response.json();

      const blob = new Blob([JSON.stringify(data.messages, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-history-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting history:", error);
    }
  };

  const currentMode = AI_MODES.find((m) => m.id === selectedMode)!;

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">
          🎭 Select AI Personality:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {AI_MODES.map((mode) => (
            <Button
              key={mode.id}
              variant={selectedMode === mode.id ? "default" : "outline"}
              onClick={() => setSelectedMode(mode.id)}
              className="h-auto flex-col p-3"
            >
              <div className="text-2xl mb-1">{mode.emoji}</div>
              <div className="text-sm font-medium">{mode.name}</div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Current Mode & Stats */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentMode.emoji}</span>
          <span className="font-medium">Currently: {currentMode.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">💬 {messageCount} messages</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowChain(!showChain)}
          >
            {showChain ? "Hide" : "Show"} Chain
          </Button>
        </div>
      </div>

      {/* Chain Visualization */}
      {showChain && chainSteps.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h4 className="font-semibold mb-3">
            🔗 Chain Pipeline Visualization:
          </h4>
          <div className="flex items-center gap-2 overflow-x-auto">
            {chainSteps.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className="text-3xl mb-1">{step.emoji}</div>
                  <div className="text-sm font-medium text-center">
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                    {step.description}
                  </div>
                </div>
                {idx < chainSteps.length - 1 && (
                  <div className="text-2xl mx-2">→</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <div className="text-4xl mb-2">{currentMode.emoji}</div>
            <p>Start a conversation with {currentMode.name}!</p>
            <p className="text-sm mt-2">
              Try: &quot;I want to visit Paris for a week&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {msg.type === "assistant" && msg.modeEmoji && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {msg.modeEmoji} {msg.mode}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={`Ask ${currentMode.name}...`}
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={messages.length === 0}
        >
          Clear History
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={messages.length === 0}
        >
          Export Chat
        </Button>
      </div>
    </div>
  );
}
