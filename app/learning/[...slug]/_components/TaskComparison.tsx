export function TaskComparison() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg shadow-md p-6 mb-6 border border-green-200 dark:border-green-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🔄 Task 4 vs Task 5 Comparison
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-600">
          <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
            ❌ Task 4 (No Context)
          </h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>• Only sends current message</li>
            <li>• Bot has amnesia 🤯</li>
            <li>• Can't understand "it", "that"</li>
            <li>• Every question is new</li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-600">
          <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
            ✅ Task 5 (With Context)
          </h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>• Sends full conversation history</li>
            <li>• Bot remembers everything 🧠</li>
            <li>• Understands references</li>
            <li>• Natural conversation flow</li>
          </ul>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded">
        💡 <strong>Pro Tip:</strong> Compare by trying the same conversation in
        both Task 4 and Task 5!
      </p>
    </div>
  );
}
