interface SystemMessageInputProps {
  systemMessage: string;
  setSystemMessage: (value: string) => void;
}

export function SystemMessageInput({
  systemMessage,
  setSystemMessage,
}: SystemMessageInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        🎭 System Role (Developer):
      </label>
      <textarea
        value={systemMessage}
        onChange={(e) => setSystemMessage(e.target.value)}
        placeholder="Set the AI's role and behavior..."
        rows={2}
        className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        💡 This sets the AI's personality and expertise
      </p>
    </div>
  );
}
