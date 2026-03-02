"use client";

import { useState } from "react";
import { getPeopleData } from "../streaming-actions";
import { readStreamableValue } from "@ai-sdk/rsc";

export default function PeopleClient() {
  const [generation, setGeneration] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    setGeneration("");
    const { object } = await getPeopleData(
      "people who sound like they have superhero names",
    );
    for await (const partial of readStreamableValue(object)) {
      if (partial) {
        setGeneration(JSON.stringify(partial, null, 2));
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating...
          </>
        ) : (
          "View People!"
        )}
      </button>

      {generation && (
        <div className="mt-6">
          <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto shadow-xl border border-gray-700 font-mono text-sm">
            {generation}
          </pre>
        </div>
      )}
    </div>
  );
}
