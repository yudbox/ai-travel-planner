import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-100 dark:bg-gray-900 py-4 px-8 flex items-center justify-between shadow">
      <nav className="flex gap-6">
        <Link href="/">Chat (useChat)</Link>
        <Link href="/streaming">Streaming Example</Link>
        <Link href="/people">People Generator</Link>
        <Link href="/stream-component">Stream Component</Link>
        <Link href="/button-demo">Button Demo</Link>
        <Link href="/places">Paris Places</Link>
      </nav>
    </header>
  );
}
