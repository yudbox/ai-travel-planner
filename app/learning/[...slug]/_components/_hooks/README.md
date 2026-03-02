# Custom Hooks

Business logic hooks for TravelExperiences component following React best practices.

## Philosophy

These hooks follow the **separation of concerns** principle:
- **State management** isolated from presentation
- **Business logic** encapsulated and reusable
- **Side effects** explicitly managed
- **Testability** improved by decoupling

---

## Hooks

### `useAddExperience()`

Manages form state and save logic for adding travel experiences to Pinecone.

**Returns:**
```typescript
{
  formData: AddExperienceFormData;      // Current form state
  updateField: (field, value) => void;  // Update single field
  saving: boolean;                      // Loading state
  saveSuccess: string;                  // Success message
  setSaveSuccess: (msg: string) => void; // Clear success message
  saveExperience: () => Promise<void>;  // Save to API
}
```

**Usage:**
```tsx
import { useAddExperience } from "./hooks";

function MyComponent() {
  const {
    formData,
    updateField,
    saving,
    saveSuccess,
    setSaveSuccess,
    saveExperience,
  } = useAddExperience();

  return (
    <form>
      <input
        value={formData.description}
        onChange={(e) => updateField("description", e.target.value)}
      />
      <button onClick={saveExperience} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
      {saveSuccess && <p>{saveSuccess}</p>}
    </form>
  );
}
```

**Features:**
- Automatic form validation
- Auto-clear form after successful save
- Error handling with user alerts
- Type-safe field updates with generics

---

### `useSearchExperiences()`

Manages search filters and search logic for finding experiences via semantic search.

**Returns:**
```typescript
{
  filters: SearchFilters;               // Current filter state
  updateFilter: (field, value) => void; // Update single filter
  searching: boolean;                   // Loading state
  results: Experience[];                // Search results
  searchExperiences: () => Promise<void>; // Execute search
}
```

**Usage:**
```tsx
import { useSearchExperiences } from "./hooks";

function MyComponent() {
  const {
    filters,
    updateFilter,
    searching,
    results,
    searchExperiences,
  } = useSearchExperiences();

  return (
    <div>
      <input
        value={filters.query}
        onChange={(e) => updateFilter("query", e.target.value)}
      />
      <button onClick={searchExperiences} disabled={searching}>
        {searching ? "Searching..." : "Search"}
      </button>
      {results.map((r) => (
        <div key={r.id}>{r.description}</div>
      ))}
    </div>
  );
}
```

**Features:**
- Default filters (all categories, high budget)
- Type-safe filter updates
- Auto-clear results before new search
- Error handling

---

### `useAutoHide(message, onClear, delay?)`

Automatically hides a message after a specified delay using useEffect.

**Parameters:**
- `message: string` - Message to auto-hide
- `onClear: () => void` - Callback to clear message
- `delay?: number` - Delay in ms (default: 5000)

**Usage:**
```tsx
import { useAutoHide } from "./hooks";

function MyComponent() {
  const [success, setSuccess] = useState("");

  // Auto-hide after 5 seconds
  useAutoHide(success, () => setSuccess(""), 5000);

  return (
    <div>
      <button onClick={() => setSuccess("Saved!")}>
        Save
      </button>
      {success && <p>{success}</p>}
    </div>
  );
}
```

**Features:**
- Reusable for any auto-hide scenario
- Cleanup on unmount prevents memory leaks
- Configurable delay

---

## Architecture Benefits

### Before (Inline Logic)
```tsx
export function TravelExperiences() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("nature");
  const [location, setLocation] = useState("");
  // ... 15 more state variables
  
  const handleSave = async () => {
    // 40 lines of logic
  };
  
  const handleSearch = async () => {
    // 30 lines of logic
  };
  
  useEffect(() => {
    // Auto-hide logic
  }, []);
  
  return (
    // 200+ lines of JSX
  );
}
```
**Issues:**
- ❌ 480 lines in one component
- ❌ Difficult to test business logic
- ❌ State management scattered
- ❌ Cannot reuse logic

### After (Custom Hooks)
```tsx
export function TravelExperiences() {
  const [mode, setMode] = useState("add");
  
  // All business logic encapsulated
  const { formData, updateField, saving, saveExperience } = useAddExperience();
  const { filters, updateFilter, searching, searchExperiences } = useSearchExperiences();
  useAutoHide(saveSuccess, () => setSaveSuccess(""), 5000);
  
  return (
    // Clean, declarative JSX
  );
}
```
**Benefits:**
- ✅ Reduced to ~300 lines (< 40% reduction)
- ✅ Business logic testable in isolation
- ✅ State grouped by feature
- ✅ Hooks reusable across components
- ✅ Easier to maintain and debug

---

## Testing Strategy

Custom hooks can be tested independently:

```tsx
import { renderHook, act } from "@testing-library/react";
import { useAddExperience } from "./useAddExperience";

test("updates description field", () => {
  const { result } = renderHook(() => useAddExperience());
  
  act(() => {
    result.current.updateField("description", "Test");
  });
  
  expect(result.current.formData.description).toBe("Test");
});

test("saves experience successfully", async () => {
  // Mock fetch
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "123", dimensions: 1536 }),
  });
  
  const { result } = renderHook(() => useAddExperience());
  
  act(() => {
    result.current.updateField("description", "Test");
    result.current.updateField("location", "Paris");
  });
  
  await act(async () => {
    await result.current.saveExperience();
  });
  
  expect(result.current.saveSuccess).toContain("Saved!");
  expect(result.current.formData.description).toBe(""); // Form cleared
});
```

---

## Best Practices Applied

1. **Single Responsibility**: Each hook handles one concern
2. **useCallback**: Memoized callbacks prevent unnecessary re-renders
3. **Type Safety**: Full TypeScript support with generics
4. **Error Boundaries**: Graceful error handling with user feedback
5. **Cleanup**: useEffect cleanup prevents memory leaks
6. **Dependency Arrays**: Explicit dependencies for predictable behavior
7. **Separation**: Business logic separate from presentation

---

## Future Enhancement Ideas

- Add `useLocalStorage` to persist form drafts
- Add `useDebounce` for search input
- Add `usePagination` for search results
- Add `useOptimisticUpdate` for instant UI feedback
- Add `useUndo` for form field history
