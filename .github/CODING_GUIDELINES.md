# Coding Guidelines

## React Component Exports

### ✅ DO: Use Named Exports

```tsx
// Component file: TaskDemo.tsx
export function TaskDemo() {
  return <div>...</div>;
}

// Import
import { TaskDemo } from "./TaskDemo";
```

### ❌ DON'T: Use Default Exports

```tsx
// ❌ AVOID
export default function TaskDemo() {
  return <div>...</div>;
}

// Import
import TaskDemo from "./TaskDemo";
```

### Why Named Exports?

1. **Better Tree Shaking** - Modern bundlers optimize unused code better
2. **IDE Support** - Autocomplete and refactoring work perfectly
3. **Consistency** - Same name everywhere, no confusion
4. **Multiple Exports** - Easy to export types, constants from same file
5. **Explicit API** - Clear what module exports

### Exception: Next.js Special Files

Default exports are **required** by Next.js for:

- `page.tsx`
- `layout.tsx`
- `error.tsx`
- `loading.tsx`
- `not-found.tsx`

```tsx
// page.tsx - default export required by Next.js
export default async function Page() {
  return <div>...</div>;
}
```

## Component Structure

### Project Structure (Next.js App Router)

**IMPORTANT:** This project uses App Router WITHOUT `src/` directory.

```
project-root/
├── app/                      # Next.js App Router (routes, pages, API)
│   ├── [route]/
│   │   ├── page.tsx          # Default export (Next.js requirement)
│   │   ├── layout.tsx        # Default export (Next.js requirement)
│   │   └── _components/      # Route-specific components
│   ├── _components/          # App-wide shared components (NOT a route)
│   │   ├── Header.tsx        # App-specific components
│   │   └── StreamingClient.tsx
│   └── api/                  # API routes
├── components/               # Reusable UI library (shadcn/ui, design system)
│   └── ui/                   # shadcn/ui components (Button, Card, Badge)
├── hooks/                    # Custom React hooks
│   └── useTaskDemo.ts        # Named export
├── lib/                      # Utility functions, helpers
│   └── utils.ts
├── .github/                  # GitHub config, workflows, guidelines
└── public/                   # Static assets
```

### Component Organization Rules

**Two separate folders:**

1. **`/components/`** (root) - UI library components (shadcn/ui, reusable design system)
   - Import: `import { Button } from "@/components/ui/button"`
2. **`/app/_components/`** - App-specific shared components (NOT a route)
   - Import: `import { Header } from "@/app/_components/Header"`
   - Underscore prefix prevents Next.js from treating it as a route

**Why separate?**

- `/components/` - Can be published as npm package, framework-agnostic
- `/app/_components/` - Tightly coupled with your app logic

### 🔒 Private Folders Rule (CRITICAL)

**ALWAYS use underscore prefix `_` for non-route folders inside `/app/`**

```
✅ DO:
app/
├── _components/        # Private folder - NOT a route
├── _hooks/             # Private folder - NOT a route
├── _utils/             # Private folder - NOT a route
└── learning/           # This IS a route (/learning)
    └── _components/    # Private folder - NOT a route

❌ DON'T:
app/
├── components/         # ❌ This becomes /components route!
├── hooks/              # ❌ This becomes /hooks route!
└── utils/              # ❌ This becomes /utils route!
```

**Why underscore prefix?**

- Next.js App Router treats every folder in `/app/` as a potential route
- Underscore `_` tells Next.js: "This is NOT a route, ignore it"
- Without `_`, you'll accidentally create unwanted routes

**Exception:** These folders are NOT routes by default:

- `api/` - API routes (special Next.js folder)
- Files with extensions (`.tsx`, `.ts`) are never routes

### 🎨 UI Components Priority

**ALWAYS prefer shadcn/ui components from `/components/ui/` over native HTML elements**

Available UI components:

- **`<Button>`** from `@/components/ui/button` - variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **`<Card>`** from `@/components/ui/card` - with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **`<Badge>`** from `@/components/ui/badge` - variants: `default`, `secondary`, `destructive`, `outline`

```tsx
// ✅ DO: Use UI library components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Button examples with variants
<Button>Submit</Button>                              // default (blue)
<Button variant="destructive" size="sm">Delete</Button>  // red
<Button variant="outline">Cancel</Button>            // outlined
<Button variant="ghost">More</Button>                // transparent hover
<Button variant="link">Read more</Button>            // link style
<Button disabled={loading}>Sending...</Button>       // disabled state

// Card example
<Card>
  <CardHeader>
    <CardTitle>Task 5: Context Management</CardTitle>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
</Card>

// Badge examples
<Badge>New</Badge>                          // default (blue)
<Badge variant="secondary">Beta</Badge>     // gray
<Badge variant="destructive">Error</Badge>  // red
<Badge variant="outline">Draft</Badge>      // outlined

// ❌ DON'T: Use native HTML elements when UI component exists
<button className="...">Delete</button>           // ❌ Use <Button> instead
<div className="rounded-lg border p-4">...</div>  // ❌ Use <Card> instead
<span className="px-2 py-1 rounded">New</span>    // ❌ Use <Badge> instead
```

**Benefits:**

- ✅ **Consistency** - Same look & feel across app
- ✅ **Accessibility** - Built-in ARIA attributes, keyboard navigation
- ✅ **Maintainability** - Change design in one place (e.g., update all buttons)
- ✅ **TypeScript** - Full type safety with variants and props
- ✅ **Dark mode** - Automatically switches theme
- ✅ **Variants** - Multiple styles available out-of-the-box

### File Organization

```
app/
├── [route]/
│   ├── page.tsx              # Default export (Next.js requirement)
│   ├── layout.tsx            # Default export (Next.js requirement)
│   └── _components/          # Route-specific components
│       ├── TaskDemo/         # Sub-folder for complex component
│       │   ├── ChatConversation.tsx
│       │   └── SubmitButton.tsx
│       ├── Header.tsx        # Named export
│       └── Footer.tsx        # Named export
├── _components/              # App-wide components (NOT a route!)
│   ├── Header.tsx
│   └── StreamingClient.tsx
```

### Component Template

```tsx
// ComponentName.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComponentNameProps {
  title: string;
  onAction?: () => void;
}

export function ComponentName({ title, onAction }: ComponentNameProps) {
  const [state, setState] = useState<string>("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Click</Button>
      </CardContent>
    </Card>
  );
}

// Export types if needed
export type { ComponentNameProps };
```

**Key points:**

- ✅ Use `<Button>` instead of `<button>`
- ✅ Use `<Card>` instead of custom `<div className="card">`
- ✅ Import UI components from `@/components/ui/`
- ✅ Named exports for components

## TypeScript

### Always use explicit types

```tsx
// ✅ DO
interface Props {
  name: string;
  age: number;
}

export function Component({ name, age }: Props) {}

// ❌ DON'T
export function Component({ name, age }: any) {}
```

## Import Order

```tsx
// 1. React and Next.js
import { useState } from "react";
import Link from "next/link";

// 2. Third-party libraries
import { clsx } from "clsx";

// 3. Internal modules (@/ paths)
import { useTaskDemo } from "@/hooks/useTaskDemo";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

// 4. Types
import type { User } from "@/types";

// 5. Relative imports
import { helper } from "../utils/helper";
import { Header } from "./_components/Header";
```

### Import Path Rules

- ✅ **DO**: Use `@/` for absolute imports from project root

  ```tsx
  import { useTaskDemo } from "@/hooks/useTaskDemo";
  import { Button } from "@/components/ui/Button";
  import { api } from "@/lib/api";
  ```

- ❌ **DON'T**: Import from non-existent directories
  ```tsx
  import { useTaskDemo } from "@/src/hooks/useTaskDemo"; // ❌ No src/ directory!
  ```

## Naming Conventions

- **Components**: PascalCase - `TaskDemo.tsx`
- **Hooks**: camelCase with `use` prefix - `useTaskDemo.ts`
- **Utilities**: camelCase - `formatDate.ts`
- **Constants**: UPPER_SNAKE_CASE - `API_KEY`
- **Types/Interfaces**: PascalCase - `UserProfile`
- **Enums**: PascalCase - `MessageRole`
- **Private folders**: underscore prefix - `_components/`

## State Management

```tsx
// ✅ DO: Descriptive names
const [isLoading, setIsLoading] = useState(false);
const [userName, setUserName] = useState("");

// ❌ DON'T: Generic names
const [flag, setFlag] = useState(false);
const [data, setData] = useState("");
```

## Custom Hooks

### When to Create Custom Hooks

Create custom hooks when:

- Component has **complex state logic** (3+ useState calls)
- Logic can be **reused** across multiple components
- Component mixes **business logic with UI** (separation of concerns)
- You need to **test logic** independently from UI

### Hook File Location

**IMPORTANT:** Place hooks in `/hooks/` directory (NOT in `/src/hooks/`)

```
hooks/
├── useTaskDemo.ts        # Task demo state management
├── useAuth.ts            # Authentication logic
└── useDebounce.ts        # Debounce utility
```

### Hook Structure

```tsx
// hooks/useTaskDemo.ts
import { useState } from "react";

interface UseTaskDemoParams {
  config: TaskConfig;
  slug: string[];
}

interface UseTaskDemoReturn {
  // States
  prompt: string;
  setPrompt: (value: string) => void;
  loading: boolean;
  error: string;

  // Actions
  makeAPICall: () => Promise<void>;
}

/**
 * Manages task demo state and API interactions.
 *
 * @param config - Task configuration
 * @param slug - URL routing slug
 * @returns State values and action handlers
 */
export function useTaskDemo({
  config,
  slug,
}: UseTaskDemoParams): UseTaskDemoReturn {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const makeAPICall = async () => {
    // Business logic here
  };

  return {
    prompt,
    setPrompt,
    loading,
    error,
    makeAPICall,
  };
}
```

### Using Custom Hooks

```tsx
// app/[route]/_components/Component.tsx
"use client";

import { useTaskDemo } from "@/hooks/useTaskDemo";

export function Component({ config, slug }) {
  const { prompt, setPrompt, loading, error, makeAPICall } = useTaskDemo({
    config,
    slug,
  });

  return (
    <div>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={makeAPICall} disabled={loading}>
        Submit
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

### Benefits

- ✅ **Separation of Concerns** - UI vs logic
- ✅ **Reusability** - Share logic across components
- ✅ **Testability** - Test hooks with [@testing-library/react-hooks](https://react-hooks-testing-library.com/)
- ✅ **Readability** - Component focuses on JSX
- ✅ **Single Responsibility** - Hook manages one concern

### Hook Naming

- ✅ **DO**: `useTaskDemo`, `useAuth`, `useDebounce`
- ❌ **DON'T**: `taskDemo`, `auth`, `debounce`

Always prefix with `use` - React enforces this convention.

## API Calls

```tsx
// ✅ DO: Handle errors properly
try {
  const res = await fetch("/api/data");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
} catch (err) {
  setError(err instanceof Error ? err.message : "Unknown error");
}

// ❌ DON'T: Ignore errors
const data = await fetch("/api/data").then((r) => r.json());
```

## Client vs Server Components

```tsx
// Server Component (default in app/)
export async function ServerComponent() {
  const data = await fetchData(); // Direct async
  return <div>{data}</div>;
}

// Client Component
("use client");

export function ClientComponent() {
  const [data, setData] = useState(null); // Hooks
  return <div>{data}</div>;
}
```

Keep Server Components when possible, use `"use client"` only when needed:

- `useState`, `useEffect` hooks
- Event handlers (`onClick`, etc.)
- Browser APIs
- Third-party libraries using hooks

---

**Last Updated:** February 21, 2026
