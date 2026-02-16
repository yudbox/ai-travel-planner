"use client";

import { useCompletion, useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";

export function TravelCompletionForm() {
  const { messages, status, error, sendMessage } = useChat({
    onFinish: ({ message, messages, ...opts }) => {
      console.log(
        "✅ Finished! Message:",
        message,
        "Messages:",
        messages,
        opts,
      );
    },
    onError: (error) => {
      console.error("❌ Error:", error);
    },
  });

  const [input, setInput] = useState("");

  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage({ text: input });
    setInput("");
  };

  useEffect(() => {
    console.log("🔄 Messages state:", messages);
  }, [messages]);

  useEffect(() => {
    console.log("⏳ Loading:", isLoading);
  }, [isLoading]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Travel Chat Assistant</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="flex flex-col gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your travel question..."
            disabled={isLoading}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-black"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}

      {/* Chat history */}
      <div className="mt-8 w-full max-w-xl p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Chat History</h2>
        <div className="flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.role === "user" ? "text-left" : "text-right"}
            >
              <span
                className={
                  msg.role === "user"
                    ? "bg-blue-100 text-blue-900 px-3 py-2 rounded-lg inline-block"
                    : "bg-gray-100 text-gray-900 px-3 py-2 rounded-lg inline-block"
                }
              >
                <b>{msg.role === "user" ? "You" : "AI"}:</b>{" "}
                {msg.parts
                  .filter((part) => part.type === "text")
                  .map((part, i) => (
                    <span key={i}>{part.text}</span>
                  ))}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="text-right">
              <span className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg inline-block animate-pulse">
                <b>AI:</b>{" "}
                <span className="inline-block align-middle mr-2">
                  Генерируется ответ...
                </span>
                <span className="inline-block w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-500">
        Status: {status} | Loading: {String(isLoading)} | Messages:{" "}
        {messages.length}
      </div>
    </>
  );
}
