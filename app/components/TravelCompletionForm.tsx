"use client";

import { useCompletion } from "@ai-sdk/react";
import { useEffect } from "react";

export function TravelCompletionForm() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useCompletion({
    api: "/api/completion",
    streamProtocol: "text", // Важно! Указываем что ожидаем text stream
    onFinish: (prompt, completion) => {
      console.log("✅ Finished! Prompt:", prompt, "Completion:", completion);
    },
    onError: (error) => {
      console.error("❌ Error:", error);
    },
  });

  useEffect(() => {
    console.log("🔄 Completion state:", completion);
  }, [completion]);

  useEffect(() => {
    console.log("⏳ Loading:", isLoading);
  }, [isLoading]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Travel app powered by Vercel</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="flex flex-col gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Where do you want to go?"
            disabled={isLoading}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-black"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Generating..." : "Generate Travel Plan"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}

      {completion && (
        <div className="mt-8 w-full max-w-xl p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Your Travel Plan:</h2>
          <div className="prose dark:prose-invert whitespace-pre-wrap">
            {completion}
          </div>
        </div>
      )}

      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-500">
        Loading: {String(isLoading)} | Completion: {completion?.length || 0}{" "}
        chars
      </div>
    </>
  );
}
