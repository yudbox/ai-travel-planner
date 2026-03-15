import DietPlanAgentClient from "./DietPlanAgentClient";

export const metadata = {
  title: "Diet Plan Agent | Module 4",
  description:
    "Multi-step AI workflow with RAG + Recipe API using LangGraph StateGraph",
};

export default function DietPlanAgentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a
              href="/learning"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Learning
            </a>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">
                🥗 Diet Plan Agent
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Multi-step AI workflow with RAG + Recipe API
              </p>
            </div>
          </div>
        </div>
      </header>

      <DietPlanAgentClient />
    </div>
  );
}
