# Journey Stack

**Headless workspace navigation for React. Track user journeys, not route hierarchies.**

Traditional breadcrumbs show where a page sits in the route tree. Journey Stack tracks where the *user* actually went — and lets them retrace their steps, work across multiple contexts, and navigate complex apps without losing their place.

---

## The Problem

In any app with cross-linked data — investment platforms, CRMs, asset registers, knowledge bases — users constantly follow relationships across domain boundaries. A client links to a portfolio, which links to a fund, which links to a research note. Traditional breadcrumbs break because the route hierarchy doesn't match the user's actual journey.

Journey Stack solves this by tracking navigation as a **workspace of chapters**, where each chapter represents a thread of related exploration. Users can drill deep, branch into new contexts, and always get back.

## Quick Start

```bash
npm install journey-stack
```

### Trail Mode — the simplest setup

Every navigation pushes onto a linear trail. Back pops. No chapters, no complexity.

```tsx
import { JourneyProvider, useJourneyNavigate, useJourney } from 'journey-stack';

function App() {
  return (
    <JourneyProvider mode="trail">
      <MyApp />
    </JourneyProvider>
  );
}

// In any component:
function DeviceLink({ id, name }) {
  const { navigate } = useJourneyNavigate();
  return <button onClick={() => navigate(`/devices/${id}`, name)}>{name}</button>;
}

// Render the trail however you want — it's headless:
function Breadcrumbs() {
  const { chapters } = useJourney();
  const steps = chapters[0]?.steps ?? [];
  return steps.map((step) => <span key={step.id}>{step.label}</span>);
}
```

That's it. Five minutes, you've got journey-aware breadcrumbs.

### Chapters Mode — multi-context workspaces

When your app has distinct domains and users juggle multiple contexts simultaneously.

```tsx
<JourneyProvider
  mode="chapters"
  domains={["clients", "funds", "research"]}
>
```

Now cross-domain navigation (e.g. `/clients/6` → `/funds/4`) automatically creates a new chapter. Same-domain navigation extends the current chapter. Users see chapter tabs, can switch between them, close them, and back through them.

## Core Concepts

### Journey

The full workspace state for a session. Contains one or more chapters.

### Chapter

A thread of related navigation. Like a browser tab with its own history. Has a domain identity, a title, and an ordered stack of steps. Chapters are created by cross-domain navigation or explicit `openFresh()` calls.

### Step

A single page visit within a chapter. Each step has a unique `id` generated on creation — even if the same path is visited multiple times across chapters, each visit is individually addressable.

### Significance

The decision engine that determines whether a navigation extends the current chapter or starts a new one. Resolved through three layers:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 | **Link-level** | Explicit `significant` parameter on the navigation call |
| 2 | **Mode strategy** | Trail → always extend. Chapters → compare domains |
| 3 | **Default** | Extend current chapter |

## Navigation Gestures

Four distinct gestures cover every navigation pattern:

### `navigate(path, label, options?)`

The primary navigation. Pushes a new step onto the active chapter — unless significance resolution determines it should create a new chapter. Options accepts `{ significant?: boolean }`.

```tsx
const { navigate } = useJourneyNavigate();

// Let the mode decide (trail extends, chapters compares domains)
navigate('/funds/4', 'Zenith Alpha');

// Force a new chapter regardless of mode
navigate('/funds/4', 'Zenith Alpha', { significant: true });

// Force same-chapter regardless of domain
navigate('/funds/4', 'Zenith Alpha', { significant: false });
```

### `replace(path, label)`

Swaps the current step in place. No stack change. The step count stays the same, back still goes where it went before. The replacement step gets a new unique `id`.

Perfect for sidebar navigation, sibling switching, tabbed views — any lateral movement where you're browsing alternatives rather than going deeper.

```tsx
const { replace } = useJourneyNavigate();

// User clicks a different fund in the sidebar
replace('/funds/5', 'Vanguard Intl Shares');
```

### `openFresh(path, label)`

Always creates a new chapter. Used for top-level navigation like main menus where the user is intentionally starting a new context.

```tsx
const { openFresh } = useJourneyNavigate();

// Main nav click
openFresh('/clients', 'Clients');
```

### `goBack()`

Pops the current step off the stack (a true pop, not a cursor move). If at the root of a chapter, closes the chapter and returns to the previous one. The entire journey unwinds naturally.

If a navigation guard is registered via `useJourneyBlock`, it will be consulted before the action proceeds.

```tsx
const { goBack } = useJourneyNavigate();

// Back button, keyboard shortcut, swipe gesture — whatever you want
goBack();
```

## Significance in Practice

The three-layer significance model means the same destination can behave differently depending on context:

```tsx
// A fund link on a research page — different domain, auto-creates a new chapter
<button onClick={() => navigate('/funds/4', 'Zenith Alpha')}>
  Investigate this fund →
</button>

// The same fund link on a client portfolio page — forced to stay in chapter
// because in this context, the fund is part of the client's story
<button onClick={() => navigate('/funds/4', 'Zenith Alpha', { significant: false })}>
  View holding
</button>

// The same fund reached from the main menu — always fresh chapter
<button onClick={() => openFresh('/funds/4', 'Zenith Alpha')}>
  Funds
</button>
```

Same URL. Three different navigation intents. The call site decides, not the destination.

## API Reference

### `<JourneyProvider>`

Wraps your app. Provides workspace context to all hooks.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'trail' \| 'chapters'` | `'trail'` | Navigation mode |
| `domains` | `string[]` | `[]` | Domain boundaries for chapters mode (top-level path segments) |
| `homePath` | `string` | `'/'` | Default path when last chapter is closed |
| `homeLabel` | `string` | `'Home'` | Default label for home chapter |

### Hooks

#### `useJourney()`

Returns the full workspace state.

```ts
const { chapters, activeChapterId } = useJourney();
```

#### `useActiveChapter()`

Returns the currently active chapter, or `undefined`.

```ts
const chapter = useActiveChapter();
// { id, title, domain, steps }
```

#### `useCurrentStep()`

Returns the current step in the active chapter.

```ts
const step = useCurrentStep();
// { id, path, label, timestamp }
```

#### `useJourneyNavigate()`

Returns navigation functions.

```ts
const { navigate, replace, openFresh, goBack } = useJourneyNavigate();
```

#### `useJourneyBlock(blocker)`

Registers a navigation guard that intercepts destructive actions (`goBack`, close chapter). Non-destructive actions (navigate, replace, openFresh) pass through unguarded.

```ts
useJourneyBlock((action) => {
  // action.type: 'back' | 'close' | 'closeAll'
  // action.chapterId: string
  if (hasUnsavedChanges) {
    return window.confirm('You have unsaved changes. Leave?');
  }
  return true;  // allow navigation
});
```

The blocker is scoped to the component lifecycle — when the component unmounts, the blocker is automatically unregistered. Multiple blockers can coexist; all must return `true` for the action to proceed.

### `<JourneyLink>`

A component for declarative journey navigation. Renders its children as a clickable element that triggers `navigate()` with optional significance control.

```tsx
import { JourneyLink } from 'journey-stack';

// Let the mode decide significance
<JourneyLink to="/funds/4" label="Zenith Alpha">
  View Fund
</JourneyLink>

// Force new chapter
<JourneyLink to="/funds/4" label="Zenith Alpha" significant>
  Investigate Fund →
</JourneyLink>

// Force same chapter
<JourneyLink to="/funds/4" label="Zenith Alpha" significant={false}>
  Related fund
</JourneyLink>
```

## State Shape

```ts
type JourneyStep = {
  id: string;         // unique per visit (crypto.randomUUID)
  path: string;
  label: string;
  timestamp: number;
};

type JourneyChapter = {
  id: string;
  title: string;
  domain: string;
  steps: JourneyStep[];
};

type JourneyWorkspace = {
  chapters: JourneyChapter[];
  activeChapterId: string;
};
```

## Modes

### Trail

The simplest mode. Every navigation pushes onto a single linear trail. No chapters, no domain logic. Back pops. Perfect for small CRUD apps, admin panels, asset registers, or any app where users follow one thread at a time.

```tsx
<JourneyProvider mode="trail">
```

### Chapters

Navigation creates chapters when crossing domain boundaries. Domains are defined as top-level path segments. Users can work across multiple chapters simultaneously, each with its own history.

```tsx
<JourneyProvider mode="chapters" domains={["clients", "funds", "research"]}>
```

A domain list of `["clients", "funds", "research"]` means:
- `/clients/6` → `/clients/9` = same domain, extends chapter
- `/clients/6` → `/funds/4` = cross-domain, new chapter
- `/funds/4` → `/funds/7` = same domain, extends chapter

The stack never drops chapters or steps. How many chapter tabs or breadcrumb items you show in the UI is a presentation concern — the library stores the full history and leaves display truncation to you.

### Route-Derived (Future)

Planned mode that reads the React Router v6 route tree directly. If the target path can nest under the current matched routes, it's a drill. If not, it's a new chapter. Zero config — the route structure IS the domain map.

## Patterns

### Breadcrumb with Overflow

The stack grows without limit. Truncate in the UI:

```tsx
function Breadcrumbs() {
  const chapter = useActiveChapter();
  const { goBack } = useJourneyNavigate();
  if (!chapter) return null;

  const steps = chapter.steps;
  const maxVisible = 3;
  const hasOverflow = steps.length > maxVisible;
  const visible = hasOverflow ? steps.slice(-maxVisible) : steps;

  return (
    <nav>
      <button onClick={goBack}>←</button>
      {hasOverflow && <span>…</span>}
      {visible.map((step) => (
        <span key={step.id}>{step.label}</span>
      ))}
    </nav>
  );
}
```

### Chapter Tabs

Render workspace tabs from the journey state:

```tsx
function ChapterTabs() {
  const { chapters, activeChapterId } = useJourney();

  return chapters.map(chapter => (
    <button
      key={chapter.id}
      data-active={chapter.id === activeChapterId}
    >
      {chapter.title} ({chapter.steps.length})
    </button>
  ));
}
```

### Sidebar with Replace

Build a contextual sidebar where clicking items swaps the view without adding to the back stack:

```tsx
function Sidebar({ items }) {
  const { replace } = useJourneyNavigate();

  return items.map(item => (
    <button key={item.id} onClick={() => replace(item.path, item.label)}>
      {item.label}
    </button>
  ));
}
```

### Main Menu with Fresh Chapters

Top-level navigation that always starts a new context:

```tsx
function MainNav({ items }) {
  const { openFresh } = useJourneyNavigate();

  return items.map(item => (
    <button key={item.path} onClick={() => openFresh(item.path, item.label)}>
      {item.label}
    </button>
  ));
}
```

### Overriding Significance on Launchpad Pages

Some pages like dashboards or search results link into multiple domains. Without overrides, every link would create a new chapter. Use `false` to keep the user in the current chapter:

```tsx
// From a dashboard — extend the current chapter, don't start a new one
<button onClick={() => navigate('/clients/6', 'Meridian', { significant: false })}>
  Meridian Super Fund
</button>
```

### Navigation Guards for Unsaved Changes

Use `useJourneyBlock` to intercept destructive navigation:

```tsx
function ClientForm({ clientId }) {
  const [isDirty, setIsDirty] = useState(false);

  useJourneyBlock((action) => {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes. Leave?');
  });

  return <form onChange={() => setIsDirty(true)}>...</form>;
}
```

The guard only fires on destructive actions — `goBack()` and chapter close. Navigating to other chapters or pushing new steps does not trigger the guard, since those transitions are non-destructive.

### Preserving Form State Across Chapter Switches

When a user switches chapters, React unmounts the inactive chapter's components. If a form has unsaved changes, that state is lost by default.

Journey Stack doesn't manage component state — but each step's unique `id` gives you a natural key for stashing and restoring drafts.

```tsx
function ClientForm({ clientId }) {
  const step = useCurrentStep();
  const stashKey = `draft:${step.id}`;

  // Rehydrate from stash on mount
  const [formState, setFormState] = useState(() => {
    const stashed = sessionStorage.getItem(stashKey);
    return stashed ? JSON.parse(stashed) : { name: '', email: '' };
  });

  // Stash on every change
  useEffect(() => {
    sessionStorage.setItem(stashKey, JSON.stringify(formState));
  }, [formState, stashKey]);

  // Clean up on save
  const handleSave = () => {
    saveMutation.mutate(formState);
    sessionStorage.removeItem(stashKey);
  };

  return <form>...</form>;
}
```

The `step.id` is unique per visit — so three `/client/new` forms open in three different chapters each get their own isolated draft. This works with any storage mechanism: `sessionStorage`, TanStack Query cache, Zustand, or a simple React context.

### Integration with React Router v6

Journey Stack manages workspace state independently. It does not import or wrap React Router. You connect the two by calling Journey Stack's navigation functions alongside React Router's:

```tsx
import { useNavigate } from 'react-router-dom';
import { useJourneyNavigate } from 'journey-stack';

function useAppNavigate() {
  const routerNavigate = useNavigate();
  const { navigate, replace, openFresh, goBack } = useJourneyNavigate();

  return {
    push(path: string, label: string, options?: { significant?: boolean }) {
      navigate(path, label, options);
      routerNavigate(path);
    },
    swap(path: string, label: string) {
      replace(path, label);
      routerNavigate(path, { replace: true });
    },
    fresh(path: string, label: string) {
      openFresh(path, label);
      routerNavigate(path);
    },
    back() {
      goBack();
      routerNavigate(-1);
    },
  };
}
```

This thin wrapper keeps the two systems in sync while leaving Journey Stack decoupled from any routing library.

## Design Philosophy

Journey Stack is **headless**. It manages workspace state and navigation logic. It renders nothing. You build your own tabs, breadcrumbs, sidebars, and back buttons — the library gives you the data and gestures to power them.

This means:
- No CSS to override
- No components to style
- No opinions on layout
- Works with any UI framework on top of React
- Total control over every pixel

The library is opinionated about the **model** (chapters, steps, significance) and unopinionated about the **presentation** (tabs, breadcrumbs, panels).

## License

MIT