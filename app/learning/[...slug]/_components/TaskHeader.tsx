import Link from "next/link";

interface TaskHeaderProps {
  moduleTitle: string;
  title: string;
  description: string;
}

export function TaskHeader({
  moduleTitle,
  title,
  description,
}: TaskHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/learning"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
      >
        ← Back to Learning
      </Link>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {moduleTitle}
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
