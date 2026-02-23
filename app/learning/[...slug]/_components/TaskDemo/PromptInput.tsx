import type { TaskConfig } from "../../../tasks-config";

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  makeAPICall: () => Promise<void>;
  config: TaskConfig;
}

export function PromptInput({
  prompt,
  setPrompt,
  makeAPICall,
  config,
}: PromptInputProps) {
  const getLabel = () => {
    if (config.isChatMode) return "💬 Your Message:";
    if (config.systemMessage) return "🙋 User Prompt:";
    return "Your Prompt:";
  };

  const getPlaceholder = () => {
    return config.isChatMode
      ? "Type your message..."
      : "Enter your prompt here...";
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {getLabel()}
      </label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && config.isChatMode) {
            e.preventDefault();
            makeAPICall();
          }
        }}
        placeholder={getPlaceholder()}
        rows={config.isChatMode ? 2 : 4}
        className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      {config.isChatMode && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          💡 Press Enter to send, Shift+Enter for new line
        </p>
      )}
    </div>
  );
}
