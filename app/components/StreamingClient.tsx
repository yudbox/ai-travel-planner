// feat: streaming logic — client component for streaming completion

"use client";

import { useState } from "react";
import { streamCompletion } from "../streaming-actions";
import { readStreamableValue } from "@ai-sdk/rsc";

export default function StreamingClient() {
  const [generation, setGeneration] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button
        disabled={loading}
        onClick={async () => {
          setGeneration("");
          setLoading(true);
          const output = await streamCompletion(
            "What is the deepest lake in the US? Make your answer very wordy.",
          );
          for await (const delta of readStreamableValue(output)) {
            setGeneration((current) => `${current}${delta}`);
          }
          setLoading(false);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Loading..." : "Ask!"}
      </button>
      <div className="w-full max-w-xl min-h-24 p-4 bg-gray-50 rounded shadow">
        {generation}
      </div>
    </main>
  );
}
