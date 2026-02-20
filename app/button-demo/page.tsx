import { GetComponentButton } from "@/app/components/GetComponentButton";

export default function ButtonDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Button Demo
        </h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Custom Accessible Button
          </h2>
          <GetComponentButton />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📚 Импорты библиотек:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
                @/components/ui/button
              </code>{" "}
              - shadcn/ui компонент
            </li>
            <li>
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
                lucide-react
              </code>{" "}
              - библиотека иконок
            </li>
            <li>
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
                @/lib/utils
              </code>{" "}
              - утилита cn() для классов
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
