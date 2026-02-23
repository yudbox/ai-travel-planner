interface TaskObjectivesProps {
  objectives: string[];
}

export function TaskObjectives({ objectives }: TaskObjectivesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🎯 Objectives
      </h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
        {objectives.map((objective, index) => (
          <li key={index}>{objective}</li>
        ))}
      </ul>
    </div>
  );
}
