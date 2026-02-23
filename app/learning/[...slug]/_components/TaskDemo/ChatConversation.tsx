import { MessageRole } from "@/app/api/learning/helpers";
import type { TaskConfig } from "../../../tasks-config";
import { Button } from "@/components/ui/button";

interface ChatConversationProps {
  chatMessages: Array<{ role: MessageRole; content: string }>;
  setChatMessages: (
    value: Array<{ role: MessageRole; content: string }>,
  ) => void;
  loading: boolean;
  config: TaskConfig;
}

export function ChatConversation({
  chatMessages,
  setChatMessages,
  loading,
  config,
}: ChatConversationProps) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          💬 Conversation
        </h3>
        {chatMessages.length > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setChatMessages([])}
            className="text-red-600 dark:text-red-400 h-auto p-0"
          >
            Clear Chat
          </Button>
        )}
      </div>

      {chatMessages.length === 0 ? (
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center text-gray-500 dark:text-gray-400">
          Start a conversation by sending a message above
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          {chatMessages.map(
            (msg: { role: MessageRole; content: string }, idx: number) => (
              <div
                key={idx}
                className={`flex ${msg.role === MessageRole.User ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === MessageRole.User
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-70">
                    {msg.role === MessageRole.User ? "You" : "🤖 Bot"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            ),
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="text-xs font-semibold mb-1 opacity-70">
                  🤖 Bot
                </div>
                <p className="text-sm text-gray-500">Typing...</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className={`mt-4 p-3 rounded-lg border ${
          config.hasContext
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700"
        }`}
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {config.hasContext ? (
            <>
              ✅ <strong>Context Enabled:</strong> This bot HAS MEMORY! It
              remembers all previous messages. Try: Ask "My weight is 80kg. How
              to lose weight?" → Then ask "What is my weight?" → Bot will
              remember 80kg! 🧠
            </>
          ) : (
            <>
              ⚠️ <strong>Important:</strong> This bot has NO MEMORY. Each
              message is sent independently. Try asking a follow-up question
              like "Tell me more about the first one" to see the limitation.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
