import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Numbered headings (# ## ###)
        h1: ({ children }) => (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border-l-4 border-blue-500 shadow-md mt-8 mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {children}
            </h1>
          </div>
        ),
        h2: ({ children }) => (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl border-l-4 border-blue-500 shadow-md mt-6 mb-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {children}
            </h2>
          </div>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2 flex items-center gap-2">
            <span className="text-blue-500">▸</span>
            {children}
          </h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-3">
            {children}
          </p>
        ),
        // Bold text
        strong: ({ children }) => (
          <strong className="font-bold text-blue-700 dark:text-blue-300">
            {children}
          </strong>
        ),
        // Lists
        ul: ({ children }) => <ul className="space-y-2 my-4">{children}</ul>,
        ol: ({ children }) => (
          <ol className="space-y-2 my-4 list-decimal list-inside">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="flex gap-3 items-start ml-4">
            <span className="text-blue-500 mt-1 text-lg">•</span>
            <span className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
              {children}
            </span>
          </li>
        ),
        // Code blocks
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto font-mono text-sm">
              {children}
            </code>
          );
        },
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
