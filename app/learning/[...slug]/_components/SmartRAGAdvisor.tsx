"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Experience {
  content: string;
  score: number;
  metadata: {
    location?: string;
    budget?: string;
    emotion?: string;
    category?: string;
  };
}

interface PipelineStage {
  status: "pending" | "loading" | "completed";
  timeMs?: number;
  data?: unknown;
}

interface RAGPipeline {
  retrieval: PipelineStage & {
    experiencesFound?: number;
    experiences?: Experience[];
  };
  augmentation: PipelineStage & {
    contextLength?: number;
    promptStructure?: string[];
  };
  generation: PipelineStage & { model?: string; temperature?: number };
  total: { timeMs?: number };
}

export function SmartRAGAdvisor() {
  const [query, setQuery] = useState("romantic places in Paris");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [pipeline, setPipeline] = useState<RAGPipeline | null>(null);

  // Filters
  const [topK, setTopK] = useState(3);
  const [budget, setBudget] = useState("");
  const [emotion, setEmotion] = useState("");
  const [location, setLocation] = useState("");
  const [namespace, setNamespace] = useState("");

  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse("");

    // Initialize pipeline state
    setPipeline({
      retrieval: { status: "loading" },
      augmentation: { status: "pending" },
      generation: { status: "pending" },
      total: {},
    });

    try {
      const filters: Record<string, string> = {};
      if (budget) filters.budget = budget;
      if (emotion) filters.emotion = emotion;
      if (location) filters.location = location;
      if (namespace) filters.namespace = namespace;

      const res = await fetch("/api/learning/module3-task2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          topK,
          filters,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.response);
      setPipeline(data.pipeline);
    } catch (error) {
      console.error("Error:", error);
      setResponse(
        `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
      );
      setPipeline(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return "bg-green-100 text-green-800";
    if (score >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.85) return "Highly Relevant";
    if (score >= 0.7) return "Related";
    return "Loosely Connected";
  };

  return (
    <div className="space-y-6">
      {/* Query & Filters */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">
          🔍 Search Travel Experiences
        </h3>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g., romantic places in Paris"
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              type="number"
              label="Top K Results"
              min="1"
              max="10"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value) || 3)}
            />
            <Select
              label="Budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              options={[
                { value: "", label: "All" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
            <Select
              label="Emotion"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              options={[
                { value: "", label: "All" },
                { value: "excited", label: "Excited" },
                { value: "peaceful", label: "Peaceful" },
                { value: "romantic", label: "Romantic" },
                { value: "adventurous", label: "Adventurous" },
              ]}
            />
            <Select
              label="Namespace"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              options={[
                { value: "", label: "All" },
                { value: "nature", label: "Nature" },
                { value: "food", label: "Food" },
                { value: "culture", label: "Culture" },
                { value: "adventure", label: "Adventure" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* RAG Pipeline Visualization */}
      {pipeline && (
        <div className="space-y-4">
          {/* Step 1: RETRIEVAL */}
          <Card
            className={`p-4 transition-all ${
              pipeline.retrieval.status === "completed"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : pipeline.retrieval.status === "loading"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse"
                  : "border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                🔍 Step 1: RETRIEVAL
                {pipeline.retrieval.status === "completed" && (
                  <Badge variant="outline" className="bg-green-100">
                    {pipeline.retrieval.timeMs}ms
                  </Badge>
                )}
              </h4>
              {pipeline.retrieval.status === "loading" && (
                <div className="text-sm text-blue-600">
                  Searching Pinecone...
                </div>
              )}
            </div>

            {pipeline.retrieval.status === "completed" &&
              pipeline.retrieval.experiences && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Found {pipeline.retrieval.experiencesFound} experiences from
                    Pinecone vector database
                  </p>
                  <div className="space-y-2">
                    {pipeline.retrieval.experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getScoreColor(exp.score)}>
                            Score: {exp.score} - {getScoreLabel(exp.score)}
                          </Badge>
                          <div className="flex gap-2 text-xs">
                            {exp.metadata.location && (
                              <Badge variant="outline">
                                📍 {exp.metadata.location}
                              </Badge>
                            )}
                            {exp.metadata.budget && (
                              <Badge variant="outline">
                                💰 {exp.metadata.budget}
                              </Badge>
                            )}
                            {exp.metadata.emotion && (
                              <Badge variant="outline">
                                😊 {exp.metadata.emotion}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm">{exp.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </Card>

          {/* Step 2: AUGMENTED */}
          <Card
            className={`p-4 transition-all ${
              pipeline.augmentation.status === "completed"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : pipeline.augmentation.status === "loading"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse"
                  : "border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                🔗 Step 2: AUGMENTED
                {pipeline.augmentation.status === "completed" && (
                  <Badge variant="outline" className="bg-green-100">
                    {pipeline.augmentation.timeMs}ms
                  </Badge>
                )}
              </h4>
            </div>

            {pipeline.augmentation.status === "completed" && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built prompt with {pipeline.augmentation.contextLength}{" "}
                  characters of context
                </p>
                {pipeline.augmentation.promptStructure && (
                  <ul className="space-y-1">
                    {pipeline.augmentation.promptStructure.map((item, idx) => (
                      <li key={idx} className="text-sm pl-4">
                        • {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>

          {/* Step 3: GENERATION */}
          <Card
            className={`p-4 transition-all ${
              pipeline.generation.status === "completed"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : pipeline.generation.status === "loading"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse"
                  : "border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                ✨ Step 3: GENERATION
                {pipeline.generation.status === "completed" && (
                  <Badge variant="outline" className="bg-green-100">
                    {pipeline.generation.timeMs}ms
                  </Badge>
                )}
              </h4>
              {pipeline.generation.status === "loading" && (
                <div className="text-sm text-blue-600">
                  ChatGPT generating...
                </div>
              )}
            </div>

            {pipeline.generation.status === "completed" && (
              <div className="space-y-2">
                <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="outline">
                    Model: {pipeline.generation.model}
                  </Badge>
                  <Badge variant="outline">
                    Temp: {pipeline.generation.temperature}
                  </Badge>
                </div>
                {response && (
                  <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500">
                    <h5 className="font-semibold mb-2">AI Response:</h5>
                    <p className="whitespace-pre-wrap text-sm">{response}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Total Time */}
          {pipeline.total.timeMs && (
            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <p className="text-sm font-semibold">
                ⚡ Total Pipeline Time: {pipeline.total.timeMs}ms
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!pipeline && !loading && (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Ready to Search!</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your query above and watch the RAG pipeline in action
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try: &quot;romantic places in Paris&quot; or &quot;adventure
            activities in mountains&quot;
          </p>
        </Card>
      )}
    </div>
  );
}
