interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
        ❌ Error:
      </h3>
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    </div>
  );
}
