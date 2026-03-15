import Link from "next/link";

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          📚 AI Learning Course
        </h1>

        <div className="space-y-8">
          {/* Module 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Module 1: OpenAI Essentials 🚀
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn the basics of OpenAI API, making requests, and understanding
              responses.
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/learning/module1/task1"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 1: First API Call
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module1/task2"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 2: Understanding Roles
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module1/task3"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 3: API Parameters (Temperature, TopP, MaxTokens)
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module1/task4"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 4: Chatbot without Context
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module1/task5"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 5: Chatbot with Context
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module1/task6"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 6: Token Limits Management
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module1/task7"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 7: Generating Images with DALL-E
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module1/task9"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 9: Voice AI Assistant (TTS & STT)
                </Link>
              </li>
            </ul>
          </div>

          {/* Module 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Module 2: Embeddings & Vector Databases 🤖
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn about embeddings, Pinecone, and semantic search through a
              practical Travel Experiences app.
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/learning/module2/task1"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 1: Travel Experiences Memory Bank (Embeddings +
                  Search)
                </Link>
              </li>
            </ul>
          </div>

          {/* Module 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Module 3: Building with LangChain 📊
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn Prompt Templates, History Pattern, Chain Pattern, and RAG
              (Retrieval-Augmented Generation) with LangChain.
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/learning/module3/task1"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 1: AI Travel Assistant (Multi-Personality Chat)
                </Link>
              </li>
              <li>
                <Link
                  href="/learning/module3/task2"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Task 2: Smart Travel RAG Advisor
                </Link>
              </li>
            </ul>
          </div>

          {/* Module 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Module 4: LangGraph Multi-Agent System 🛠️
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Build a production-ready Diet Plan Agent with StateGraph, ReAct
              pattern, Spoonacular API integration, and Pinecone memory system.
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/learning/module4/diet-plan-agent"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  ✅ Diet Plan Agent - Multi-step workflow with RAG + Recipe API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Note:</strong> Complete tasks in order. Each task builds
            on previous knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}
