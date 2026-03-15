import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-100 dark:bg-gray-900 py-4 px-8 flex items-center justify-between shadow">
      <nav className="flex gap-6">
        <Link href="/" className="font-semibold text-lg">
          ⚛️ AI for React
        </Link>
        <Link href="/learning" className="font-semibold text-lg">
          📚 Learning
        </Link>
      </nav>
    </header>
  );
}
