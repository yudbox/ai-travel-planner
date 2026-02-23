interface ExperimentSuggestionProps {
  systemMessage: string;
}

export function ExperimentSuggestion({
  systemMessage,
}: ExperimentSuggestionProps) {
  return (
    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
        🧪 Try This Experiment:
      </h3>
      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
        <li>Keep the system message: "{systemMessage}"</li>
        <li>Ask your question and see the specialized response</li>
        <li>Now delete the system message (clear the field)</li>
        <li>Ask the same question again</li>
        <li>Compare the responses - notice how different they are!</li>
      </ol>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        💡 The system message dramatically changes the AI's expertise and
        response style.
      </p>
    </div>
  );
}
