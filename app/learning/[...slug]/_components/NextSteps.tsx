import Link from "next/link";

interface NextStepsProps {
  nextTask: string;
}

export function NextSteps({ nextTask }: NextStepsProps) {
  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        ⏩ <strong>Next:</strong>{" "}
        <Link
          href={`/learning/${nextTask}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Continue to next task →
        </Link>
      </p>
    </div>
  );
}
