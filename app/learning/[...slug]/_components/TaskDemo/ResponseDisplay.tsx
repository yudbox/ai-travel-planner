interface ResponseDisplayProps {
  response: string;
}

export function ResponseDisplay({ response }: ResponseDisplayProps) {
  if (!response) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        ✅ Response:
      </h3>
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {response}
        </p>
      </div>
    </div>
  );
}
