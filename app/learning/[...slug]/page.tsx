import Link from "next/link";
import { getTaskConfig } from "../tasks-config";
import { TaskDemo } from "./_components/TaskDemo";
import { TaskHeader } from "./_components/TaskHeader";
import { TaskObjectives } from "./_components/TaskObjectives";
import { TaskComparison } from "./_components/TaskComparison";
import { ExperimentSuggestion } from "./_components/ExperimentSuggestion";
import { NextSteps } from "./_components/NextSteps";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // Parse slug: [module, task]
  const module = slug?.[0];
  const task = slug?.[1];

  const config = module && task ? getTaskConfig(module, task) : null;

  if (!config || !module || !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Task Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The task {slug?.join("/")} doesn't exist yet.
          </p>
          <Link
            href="/learning"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <TaskHeader
          moduleTitle={config.moduleTitle}
          title={config.title}
          description={config.description}
        />

        <TaskObjectives objectives={config.objectives} />

        {config.hasContext && <TaskComparison />}

        <TaskDemo config={config} slug={slug} />

        {config.systemMessage && (
          <ExperimentSuggestion systemMessage={config.systemMessage} />
        )}

        {config.nextTask && <NextSteps nextTask={config.nextTask} />}
      </div>
    </div>
  );
}
