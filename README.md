# Journey Stack

**Headless workspace navigation for React. Track user journeys, not route hierarchies.**

### **[Live Demo: IT Asset Register](https://shobman.github.io/journey-stack/)**

Traditional breadcrumbs show where a page sits in the route tree. Journey Stack tracks where the *user* actually went — and lets them retrace their steps, work across multiple contexts, and navigate complex apps without losing their place.

---

## The Problem

In any app with cross-linked data — IT asset registers, CRMs, service catalogs, knowledge bases — users constantly follow relationships across domain boundaries. A device links to its assigned user, who links to their company, which links to its service contracts. Traditional breadcrumbs break because the route hierarchy doesn't match the user's actual journey.

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
  domains={["devices", "services", "companies"]}
>
```

Now cross-domain navigation (e.g. `/devices/3` → `/companies/1`) automatically creates a new chapter. Same-domain navigation extends the current chapter. Users see chapter tabs, can switch between them, close them, and back through them.

## Core Concepts

### Journey

The full workspace state for a session. Contains one or more chapters.

### Chapter

A thread of related navigation. Like a browser tab with its own history. Has a domain identity, a title, and an ordered stack of steps. Chapters are created by cross-domain navigation, explicit `openFresh()` calls, or `openOrFocus()` when no matching chapter exists.

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

Eight distinct gestures cover every navigation pattern:

### `navigate(path, label, options?)`

The primary navigation. Pushes a new step onto the active chapter — unless significance resolution determines it should create a new chapter. Options accepts `{ significant?: boolean }`.

```tsx
const { navigate } = useJourneyNavigate();

// Let the mode decide (trail extends, chapters compares domains)
navigate('/services/2', 'AWS Infrastructure');

// Force a new chapter regardless of mode
navigate('/services/2', 'AWS Infrastructure', { significant: true });

// Force same-chapter regardless of domain
navigate('/services/2', 'AWS Infrastructure', { significant: false });
```

### `replace(path, label)`

Swaps the current step in place. No stack change. The step count stays the same, back still goes where it went before. The replacement step gets a new unique `id`.

Perfect for sidebar navigation, sibling switching, tabbed views — any lateral movement where you're browsing alternatives rather than going deeper.

```tsx
const { replace } = useJourneyNavigate();

// User clicks a different device in the sidebar
replace('/devices/5', 'HP ProLiant DL380');
```

### `openFresh(path, label)`

Always creates a new chapter. Used for actions that should always produce a fresh context — like "New Asset" buttons where each click should open an independent form.

```tsx
const { openFresh } = useJourneyNavigate();

// "New Asset" button — always a new chapter
openFresh('/assets/new', 'New Asset');
```

### `openOrFocus(path, label)`

The persistent navigation gesture. If a chapter already exists whose domain matches the target path's domain, switches to that chapter. If no matching chapter exists, creates a new one.

This is the gesture for main navigation — clicking "Devices" should always take you to the Devices chapter, not spawn a duplicate.

```tsx
const { openOrFocus } = useJourneyNavigate();

// Main nav — reuse existing chapter or create one
openOrFocus('/devices', 'Devices');
openOrFocus('/services', 'Services');

// Clicking "Devices" again switches back — no duplicate
openOrFocus('/devices', 'Devices');
```

### `goBack(count?)`

Pops `count` steps off the stack (default 1). This is a true pop, not a cursor move. If the count exceeds the number of steps in the active chapter, closes the chapter and returns to the previous one. The entire journey unwinds naturally.

If a navigation guard is registered via `useJourneyBlock`, it will be consulted once before the action proceeds — not once per step.

```tsx
const { goBack } = useJourneyNavigate();

// Pop one step
goBack();

// Pop three steps at once (e.g. breadcrumb click)
goBack(3);

// If count >= steps in chapter, closes the chapter
goBack(10);
```

### `closeChapter(chapterId)`

Explicitly closes a chapter by ID. If closing the active chapter, activates the previous one. If closing the last chapter, resets to the home chapter.

Respects navigation guards.

```tsx
const { closeChapter } = useJourneyNavigate();

// Chapter tab × button
closeChapter(chapter.id);
```

### `focusChapter(chapterId)`

Switches the active chapter without closing any chapters. If the chapter is already active, this is a no-op.

```tsx
const { focusChapter } = useJourneyNavigate();

// Switch to an existing chapter (e.g. clicking a chapter tab)
focusChapter(chapter.id);
```

## Significance in Practice

The three-layer significance model means the same destination can behave differently depending on context:

```tsx
// A company link on a device page — different domain, auto-creates a new chapter
<button onClick={() => navigate('/companies/1', 'Dell Technologies')}>
  View vendor →
</button>

// The same company link on a user page — forced to stay in chapter
// because in this context, the company is part of the user's story
<button onClick={() => navigate('/companies/1', 'Dell Technologies', { significant: false })}>
  View employer
</button>

// The same company reached from the main menu — persistent chapter
<button onClick={() => openOrFocus('/companies', 'Companies')}>
  Companies
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
const { chapters, activeChapterId, focusStack } = useJourney();
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
const { navigate, replace, openFresh, openOrFocus, goBack, closeChapter, focusChapter } = useJourneyNavigate();
```

#### `useJourneyBlock(blocker)`

Registers a navigation guard that intercepts destructive actions (`goBack`, `closeChapter`). Non-destructive actions (navigate, replace, openFresh, openOrFocus, focusChapter) pass through unguarded.

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

#### `useWillBranch(path, significant?)`

A pure-read hook that predicts whether navigating to `path` would create a new chapter (branch) based on the current significance resolution. Does not perform any navigation.

```ts
const willBranch = useWillBranch('/companies/1');
// true if navigating there would create a new chapter

const forcedBranch = useWillBranch('/companies/1', true);
// true — significance override forces a branch

const forcedExtend = useWillBranch('/companies/1', false);
// false — significance override forces same-chapter
```

Useful for showing visual hints on links that will open a new chapter (e.g. a different color or icon).

#### `useJourneyBrowserSync()`

Syncs journey state with the browser's History API (`pushState`/`popstate`). Call this once in your app shell to enable browser back/forward button support.

```tsx
function AppShell() {
  useJourneyBrowserSync();
  return <>{/* your app */}</>;
}
```

Not needed if you're using React Router integration — in that case, write your own sync hook that coordinates both systems.

### `<JourneyLink>`

A component for declarative journey navigation. Renders its children as a clickable element that triggers `navigate()` with optional significance control.

```tsx
import { JourneyLink } from 'journey-stack';

// Let the mode decide significance
<JourneyLink to="/devices/3" label="MacBook Pro 16″">
  View Device
</JourneyLink>

// Force new chapter
<JourneyLink to="/devices/3" label="MacBook Pro 16″" significant>
  Investigate Device →
</JourneyLink>

// Force same chapter
<JourneyLink to="/devices/3" label="MacBook Pro 16″" significant={false}>
  Related device
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
  focusStack: string[];       // chapter IDs in focus order (last = active)
  activeChapterId: string;    // derived from focusStack
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
<JourneyProvider mode="chapters" domains={["devices", "services", "companies"]}>
```

A domain list of `["devices", "services", "companies"]` means:
- `/devices/1` → `/devices/3` = same domain, extends chapter
- `/devices/1` → `/companies/2` = cross-domain, new chapter
- `/services/3` → `/services/5` = same domain, extends chapter

The stack never drops chapters or steps. How many chapter tabs or breadcrumb items you show in the UI is a presentation concern — the library stores the full history and leaves display truncation to you.

### Route-Derived (Future)

Planned mode that reads the React Router v6 route tree directly. If the target path can nest under the current matched routes, it's a drill. If not, it's a new chapter. Zero config — the route structure IS the domain map.

## Patterns

### Clickable Breadcrumbs

The stack grows without limit. Truncate in the UI. Clicking an earlier breadcrumb step pops back to that point using `goBack(count)`:

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
      <button onClick={() => goBack()}>←</button>
      {hasOverflow && <span>…</span>}
      {visible.map((step, i) => {
        const isLast = i === visible.length - 1;
        const popCount = steps.length - 1 - steps.indexOf(step);
        return (
          <span key={step.id}>
            {isLast ? (
              <strong>{step.label}</strong>
            ) : (
              <button onClick={() => goBack(popCount)}>{step.label}</button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

### Chapter Tabs with Close

Render workspace tabs from the journey state, with × buttons to close chapters:

```tsx
function ChapterTabs() {
  const { chapters, activeChapterId } = useJourney();
  const { focusChapter, closeChapter } = useJourneyNavigate();

  return chapters.map(chapter => (
    <div key={chapter.id} data-active={chapter.id === activeChapterId}>
      <button onClick={() => focusChapter(chapter.id)}>
        {chapter.title} ({chapter.steps.length})
      </button>
      <button onClick={() => closeChapter(chapter.id)}>×</button>
    </div>
  ));
}
```

### Sidebar with Replace

Build a contextual sidebar where clicking items swaps the view without adding to the back stack:

```tsx
function DeviceSidebar({ devices }) {
  const { replace } = useJourneyNavigate();

  return devices.map(device => (
    <button key={device.id} onClick={() => replace(`/devices/${device.id}`, device.name)}>
      {device.name}
    </button>
  ));
}
```

### Main Menu with Persistent Chapters

Top-level navigation that reuses existing chapters instead of spawning duplicates:

```tsx
function MainNav() {
  const { openOrFocus, openFresh } = useJourneyNavigate();

  return (
    <nav>
      <button onClick={() => openOrFocus('/dashboard', 'Dashboard')}>Dashboard</button>
      <button onClick={() => openOrFocus('/devices', 'Devices')}>Devices</button>
      <button onClick={() => openOrFocus('/services', 'Services')}>Services</button>
      <button onClick={() => openOrFocus('/companies', 'Companies')}>Companies</button>
      <button onClick={() => openFresh('/assets/new', 'New Asset')}>+ New Asset</button>
    </nav>
  );
}
```

`openOrFocus` finds the existing chapter for a domain, while `openFresh` always creates a new one. Click "Devices" twice? Same chapter. Click "New Asset" twice? Two independent chapters.

### Overriding Significance on Dashboard Pages

Some pages like dashboards or search results link into multiple domains. Without overrides, every link would create a new chapter. Use `false` to keep the user in the current chapter:

```tsx
// From a dashboard — extend the current chapter, don't start a new one
<button onClick={() => navigate('/devices/1', 'MacBook Pro', { significant: false })}>
  MacBook Pro 16″
</button>
```

### Navigation Guards for Unsaved Changes

Use `useJourneyBlock` to intercept destructive navigation:

```tsx
function AssetForm() {
  const [isDirty, setIsDirty] = useState(false);

  useJourneyBlock((action) => {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes. Leave?');
  });

  return <form onChange={() => setIsDirty(true)}>...</form>;
}
```

The guard fires on destructive actions — `goBack()` and `closeChapter()`. Navigating to other chapters, focusing chapters, or pushing new steps does not trigger the guard, since those transitions are non-destructive.

### Preserving Form State Across Chapter Switches

When a user switches chapters, React unmounts the inactive chapter's components. If a form has unsaved changes, that state is lost by default.

Journey Stack doesn't manage component state — but each step's unique `id` gives you a natural key for stashing and restoring drafts.

```tsx
function AssetForm() {
  const step = useCurrentStep();
  const stashKey = `draft:${step.id}`;

  // Rehydrate from stash on mount
  const [formState, setFormState] = useState(() => {
    const stashed = sessionStorage.getItem(stashKey);
    return stashed ? JSON.parse(stashed) : { name: '', type: '' };
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

The `step.id` is unique per visit — so three `/assets/new` forms open in three different chapters each get their own isolated draft. This works with any storage mechanism: `sessionStorage`, TanStack Query cache, Zustand, or a simple React context.

### Integration with React Router v6

Journey Stack manages workspace state independently. It does not import or wrap React Router. You connect the two by calling Journey Stack's navigation functions alongside React Router's:

```tsx
import { useNavigate } from 'react-router-dom';
import { useJourneyNavigate } from 'journey-stack';

function useAppNavigate() {
  const routerNavigate = useNavigate();
  const { navigate, replace, openFresh, openOrFocus, goBack, closeChapter, focusChapter } = useJourneyNavigate();

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
    focus(path: string, label: string) {
      openOrFocus(path, label);
      routerNavigate(path);
    },
    back(count?: number) {
      goBack(count);
      // Sync hook detects state change and updates Router
    },
  };
}
```

This thin wrapper keeps the two systems in sync while leaving Journey Stack decoupled from any routing library. For backward navigation (`back`, `closeChapter`, `focusChapter`), you typically only call journey-stack and let a sync effect update the router — see the example app for a full bidirectional sync implementation.

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
