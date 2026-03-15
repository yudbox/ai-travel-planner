import Link from "next/link";

export default function AIForReactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          ⚛️ AI for React
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Interactive examples of AI integration with React using Vercel AI SDK
        </p>

        <div className="space-y-8">
          {/* Vercel AI SDK Module */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Vercel AI SDK Examples 🚀
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn how to use Vercel AI SDK hooks and streaming in React
              applications
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/chat"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Chat (useChat) - Interactive chat with OpenAI
                </Link>
              </li>
              <li>
                <Link
                  href="/streaming"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Streaming Example - Real-time response streaming
                </Link>
              </li>
              <li>
                <Link
                  href="/stream-component"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Stream Component - Component-based streaming
                </Link>
              </li>
            </ul>
          </div>

          {/* React Server Components Module */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              React Server Components 🎨
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Examples of AI integration with React Server Components and Server
              Actions
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/people"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ People Generator - Generate user profiles with AI
                </Link>
              </li>
              <li>
                <Link
                  href="/button-demo"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Button Demo - Interactive UI with Server Actions
                </Link>
              </li>
              <li>
                <Link
                  href="/places"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Paris Places - Discover places with AI recommendations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Note:</strong> These examples demonstrate different
            approaches to integrating AI in React applications. Explore each to
            learn various patterns and best practices.
          </p>
        </div>
      </div>
    </div>
  );
}
