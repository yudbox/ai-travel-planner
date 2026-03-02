# UI Components Library

Reusable UI components built with TypeScript, Tailwind CSS, and CVA (class-variance-authority).

## Components

### Alert

Success/error/warning/info notifications with icons and close button.

```tsx
import { Alert } from "@/components/ui/alert";

<Alert variant="success" icon="✅" onClose={() => setMessage("")}>
  Operation completed successfully!
</Alert>

<Alert variant="error" title="Error" icon="❌">
  Something went wrong. Please try again.
</Alert>
```

**Props:**

- `variant`: "default" | "success" | "error" | "warning" | "info"
- `title?`: Optional heading text
- `icon?`: Optional emoji or icon
- `onClose?`: Callback for close button
- Supports all standard div props

---

### Button

Primary button component with variants and sizes.

```tsx
import { Button } from "@/components/ui/button";

<Button onClick={handleClick}>Click Me</Button>
<Button variant="secondary" size="lg">Large Secondary</Button>
<Button variant="outline" disabled>Disabled</Button>
```

**Props:**

- `variant`: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- Supports all standard button props

---

### ButtonGroup

Multi-select or single-select button group (used for categories, emotions, etc).

```tsx
import { ButtonGroup } from "@/components/ui/button-group";

<ButtonGroup
  label="Select Categories"
  options={[
    { value: "nature", label: "Nature", icon: "🌿" },
    { value: "food", label: "Food", icon: "🍕" },
  ]}
  value={selected}
  onChange={setSelected}
  multiSelect={true}
/>;
```

**Props:**

- `options`: Array of `{ value, label, icon? }`
- `value`: Array of selected values
- `onChange`: Callback with updated array
- `label?`: Optional label text
- `helperText?`: Optional helper text
- `multiSelect?`: Enable multiple selection (default: true)

---

### Input

Text input with label, error state, and helper text.

```tsx
import { Input } from "@/components/ui/input";

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  helperText="We'll never share your email"
/>

<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error="Username already taken"
/>
```

**Props:**

- `label?`: Label text
- `error?`: Error message (auto sets error styling)
- `helperText?`: Helper text (hidden if error present)
- `variant?`: "default" | "error"
- Supports all standard input props

---

### Select

Dropdown select with label and options.

```tsx
import { Select } from "@/components/ui/select";

<Select
  label="Budget"
  value={budget}
  onChange={(e) => setBudget(e.target.value)}
  options={[
    { value: "low", label: "Low Budget" },
    { value: "mid", label: "Mid Budget" },
    { value: "high", label: "High Budget" },
  ]}
  placeholder="Select budget..."
/>;
```

**Props:**

- `label?`: Label text
- `options`: Array of `{ value, label }`
- `placeholder?`: Placeholder option (disabled)
- `error?`: Error message
- `helperText?`: Helper text
- Supports all standard select props

---

### Tabs

Tab switcher for navigation between views.

```tsx
import { Tabs } from "@/components/ui/tabs";

<Tabs
  tabs={[
    { value: "add", label: "Add Experience", icon: "📝" },
    { value: "search", label: "Search", icon: "🔍" },
  ]}
  value={activeTab}
  onValueChange={setActiveTab}
/>;
```

**Props:**

- `tabs`: Array of `{ value, label, icon? }`
- `value`: Current active tab value
- `onValueChange`: Callback with new value
- `className?`: Additional classes

---

### Textarea

Multi-line text input with character count and auto-resize.

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Enter details..."
  rows={4}
  maxLength={500}
  showCount
/>;
```

**Props:**

- `label?`: Label text
- `error?`: Error message
- `helperText?`: Helper text
- `showCount?`: Show character count (requires maxLength)
- `maxLength?`: Maximum character count
- Supports all standard textarea props

---

## Design Tokens

All components support dark mode via Tailwind's `dark:` prefix.

**Colors:**

- Primary: Blue (blue-600, blue-700)
- Success: Green (green-50, green-800)
- Error: Red (red-50, red-800)
- Warning: Yellow (yellow-50, yellow-800)
- Info: Blue (blue-50, blue-800)

**Spacing:**

- Standard padding: px-3 py-2
- Standard gap: gap-2, gap-4
- Standard rounded: rounded-md

**Typography:**

- Labels: text-sm font-medium
- Inputs: text-sm
- Helper text: text-xs

---

## Usage Example

```tsx
"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Input,
  Select,
  Tabs,
  Textarea,
} from "@/components/ui";

export function MyForm() {
  const [mode, setMode] = useState("form");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(["tech"]);
  const [success, setSuccess] = useState("");

  return (
    <div className="p-6">
      <Tabs
        tabs={[
          { value: "form", label: "Form" },
          { value: "preview", label: "Preview" },
        ]}
        value={mode}
        onValueChange={setMode}
      />

      {mode === "form" && (
        <div className="space-y-4 mt-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <ButtonGroup
            label="Categories"
            options={[
              { value: "tech", label: "Tech" },
              { value: "design", label: "Design" },
            ]}
            value={category}
            onChange={setCategory}
          />

          <Button onClick={() => setSuccess("Saved!")}>Save</Button>

          {success && (
            <Alert variant="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Import Shortcuts

Use barrel imports from `@/components/ui`:

```tsx
// ✅ Recommended
import { Button, Input, Select } from "@/components/ui";

// ❌ Avoid individual imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```
