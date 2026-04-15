# Journey Stack

[![npm version](https://img.shields.io/npm/v/journey-stack)](https://www.npmjs.com/package/journey-stack)
[![bundle size](https://img.shields.io/bundlephobia/minzip/journey-stack)](https://bundlephobia.com/package/journey-stack)
[![license](https://img.shields.io/npm/l/journey-stack)](https://github.com/shobman/journey-stack/blob/main/packages/journey-stack/package.json)

**Headless workspace navigation for React. Track user journeys, not route hierarchies.**

### **[Live Demo: IT Asset Register](https://shobman.github.io/journey-stack/)**

Traditional breadcrumbs show where a page sits in the route tree. Journey Stack tracks where the *user* actually went — and lets them retrace their steps, work across multiple contexts, and navigate complex apps without losing their place.

---

## The Problem

In any app with cross-linked data — IT asset registers, CRMs, service catalogs, knowledge bases — users constantly follow relationships across domain boundaries. A device links to its assigned user, who links to their company, which links to its service contracts. Traditional breadcrumbs break because the route hierarchy doesn't match the user's actual journey.

Journey Stack solves this by tracking navigation as **workspaces**, where each workspace represents a thread of related exploration. Users can drill deep, branch into new contexts, and always get back.

## Quick Start

```bash
npm install journey-stack
```

### Trail Mode — the simplest setup

Every navigation pushes onto a linear trail. Back pops. No workspaces, no complexity.

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
  const { workspaces } = useJourney();
  const steps = workspaces[0]?.steps ?? [];
  return steps.map((step) => <span key={step.id}>{step.label}</span>);
}
```

That's it. Five minutes, you've got journey-aware breadcrumbs.

### Workspaces Mode — multi-context navigation

When your app has distinct domains and users juggle multiple contexts simultaneously.

```tsx
<JourneyProvider
  mode="workspaces"
  domains={["devices", "services", "companies"]}
>
```

Now cross-domain navigation (e.g. `/devices/3` → `/companies/1`) automatically creates a new workspace. Same-domain navigation extends the current workspace. Users see workspace tabs, can switch between them, close them, and back through them.

## Core Concepts

### Journey

The full journey state for a session. Contains one or more workspaces.

### Workspace

A thread of related navigation. Like a browser tab with its own history. Has a domain identity, a title, and an ordered stack of steps. Workspaces are created by cross-domain navigation, explicit `openFresh()` calls, or `openOrFocus()` when no matching workspace exists.

### Step

A single page visit within a workspace. Each step has a unique `id` generated on creation — even if the same path is visited multiple times across workspaces, each visit is individually addressable.

### Significance

The decision engine that determines whether a navigation extends the current workspace or starts a new one. Resolved through three layers:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 | **Link-level** | Explicit `significant` parameter on the navigation call |
| 2 | **Mode strategy** | Trail → always extend. Workspaces → compare domains |
| 3 | **Default** | Extend current workspace |

## Navigation Gestures

Eight distinct gestures cover every navigation pattern:

### `navigate(path, label, options?)`

The primary navigation. Pushes a new step onto the active workspace — unless significance resolution determines it should create a new workspace. Options accepts `{ significant?: boolean }`.

```tsx
const { navigate } = useJourneyNavigate();

// Let the mode decide (trail extends, workspaces compares domains)
navigate('/services/2', 'AWS Infrastructure');

// Force a new workspace regardless of mode
navigate('/services/2', 'AWS Infrastructure', { significant: true });

// Force same-workspace regardless of domain
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

Always creates a new workspace. Used for actions that should always produce a fresh context — like "New Asset" buttons where each click should open an independent form.

```tsx
const { openFresh } = useJourneyNavigate();

// "New Asset" button — always a new workspace
openFresh('/assets/new', 'New Asset');
```

### `openOrFocus(path, label)`

The persistent navigation gesture. If a workspace already exists whose domain matches the target path's domain, switches to that workspace. If no matching workspace exists, creates a new one.

This is the gesture for main navigation — clicking "Devices" should always take you to the Devices workspace, not spawn a duplicate.

```tsx
const { openOrFocus } = useJourneyNavigate();

// Main nav — reuse existing workspace or create one
openOrFocus('/devices', 'Devices');
openOrFocus('/services', 'Services');

// Clicking "Devices" again switches back — no duplicate
openOrFocus('/devices', 'Devices');
```

### `goBack(count?)`

Pops `count` steps off the stack (default 1). This is a true pop, not a cursor move. If the count exceeds the number of steps in the active workspace, closes the workspace and returns to the previous one. The entire journey unwinds naturally.

If a navigation guard is registered via `useJourneyBlock`, it will be consulted once before the action proceeds — not once per step.

```tsx
const { goBack } = useJourneyNavigate();

// Pop one step
goBack();

// Pop three steps at once (e.g. breadcrumb click)
goBack(3);

// If count >= steps in workspace, closes the workspace
goBack(10);
```

### `closeWorkspace(workspaceId)`

Explicitly closes a workspace by ID. If closing the active workspace, activates the previous one. If closing the last workspace, resets to the home workspace.

Respects navigation guards.

```tsx
const { closeWorkspace } = useJourneyNavigate();

// Workspace tab × button
closeWorkspace(workspace.id);
```

### `focusWorkspace(workspaceId)`

Switches the active workspace without closing any workspaces. If the workspace is already active, this is a no-op.

```tsx
const { focusWorkspace } = useJourneyNavigate();

// Switch to an existing workspace (e.g. clicking a workspace tab)
focusWorkspace(workspace.id);
```

## Significance in Practice

The three-layer significance model means the same destination can behave differently depending on context:

```tsx
// A company link on a device page — different domain, auto-creates a new workspace
<button onClick={() => navigate('/companies/1', 'Dell Technologies')}>
  View vendor →
</button>

// The same company link on a user page — forced to stay in workspace
// because in this context, the company is part of the user's story
<button onClick={() => navigate('/companies/1', 'Dell Technologies', { significant: false })}>
  View employer
</button>

// The same company reached from the main menu — persistent workspace
<button onClick={() => openOrFocus('/companies', 'Companies')}>
  Companies
</button>
```

Same URL. Three different navigation intents. The call site decides, not the destination.

## API Reference

### `<JourneyProvider>`

Wraps your app. Provides journey context to all hooks.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'trail' \| 'workspaces'` | `'trail'` | Navigation mode |
| `domains` | `string[]` | `[]` | Domain boundaries for workspaces mode (top-level path segments) |
| `homePath` | `string` | `'/'` | Default path when last workspace is closed |
| `homeLabel` | `string` | `'Home'` | Default label for home workspace |

### Hooks

#### `useJourney()`

Returns the full journey state.

```ts
const { workspaces, activeWorkspaceId, focusStack } = useJourney();
```

#### `useActiveWorkspace()`

Returns the currently active workspace, or `undefined`.

```ts
const workspace = useActiveWorkspace();
// { id, title, domain, steps }
```

#### `useCurrentStep()`

Returns the current step in the active workspace.

```ts
const step = useCurrentStep();
// { id, path, label, timestamp }
```

#### `useJourneyNavigate()`

Returns navigation functions.

```ts
const { navigate, replace, openFresh, openOrFocus, goBack, closeWorkspace, focusWorkspace } = useJourneyNavigate();
```

#### `useJourneyBlock(blocker)`

Registers a navigation guard that intercepts destructive actions (`goBack`, `closeWorkspace`). Non-destructive actions (navigate, replace, openFresh, openOrFocus, focusWorkspace) pass through unguarded.

```ts
useJourneyBlock((action) => {
  // action.type: 'back' | 'close' | 'closeAll'
  // action.workspaceId: string
  if (hasUnsavedChanges) {
    return window.confirm('You have unsaved changes. Leave?');
  }
  return true;  // allow navigation
});
```

The blocker is scoped to the component lifecycle — when the component unmounts, the blocker is automatically unregistered. Multiple blockers can coexist; all must return `true` for the action to proceed.

#### `useWillBranch(path, significant?)`

A pure-read hook that predicts whether navigating to `path` would create a new workspace (branch) based on the current significance resolution. Does not perform any navigation.

```ts
const willBranch = useWillBranch('/companies/1');
// true if navigating there would create a new workspace

const forcedBranch = useWillBranch('/companies/1', true);
// true — significance override forces a branch

const forcedExtend = useWillBranch('/companies/1', false);
// false — significance override forces same-workspace
```

Useful for showing visual hints on links that will open a new workspace (e.g. a different color or icon).

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

// Force new workspace
<JourneyLink to="/devices/3" label="MacBook Pro 16″" significant>
  Investigate Device →
</JourneyLink>

// Force same workspace
<JourneyLink to="/devices/3" label="MacBook Pro 16″" significant={false}>
  Related device
</JourneyLink>
```

## State Shape

```ts
type JourneyStep = {
  id: string;         // unique per visit (UUID v4)
  path: string;
  label: string;
  timestamp: number;
};

type JourneyWorkspace = {
  id: string;
  title: string;
  domain: string;
  steps: JourneyStep[];
};

type JourneyState = {
  workspaces: JourneyWorkspace[];
  focusStack: string[];           // workspace IDs in focus order (last = active)
  activeWorkspaceId: string;      // derived from focusStack
};
```

## Modes

### Trail

The simplest mode. Every navigation pushes onto a single linear trail. No workspaces, no domain logic. Back pops. Perfect for small CRUD apps, admin panels, asset registers, or any app where users follow one thread at a time.

```tsx
<JourneyProvider mode="trail">
```

### Workspaces

Navigation creates workspaces when crossing domain boundaries. Domains are defined as top-level path segments. Users can work across multiple workspaces simultaneously, each with its own history.

```tsx
<JourneyProvider mode="workspaces" domains={["devices", "services", "companies"]}>
```

A domain list of `["devices", "services", "companies"]` means:
- `/devices/1` → `/devices/3` = same domain, extends workspace
- `/devices/1` → `/companies/2` = cross-domain, new workspace
- `/services/3` → `/services/5` = same domain, extends workspace

The stack never drops workspaces or steps. How many workspace tabs or breadcrumb items you show in the UI is a presentation concern — the library stores the full history and leaves display truncation to you.

### Route-Derived (Future)

Planned mode that reads the React Router v6 route tree directly. If the target path can nest under the current matched routes, it's a drill. If not, it's a new workspace. Zero config — the route structure IS the domain map.

## Patterns

### Clickable Breadcrumbs

The stack grows without limit. Truncate in the UI. Clicking an earlier breadcrumb step pops back to that point using `goBack(count)`:

```tsx
function Breadcrumbs() {
  const workspace = useActiveWorkspace();
  const { goBack } = useJourneyNavigate();
  if (!workspace) return null;

  const steps = workspace.steps;
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

### Workspace Tabs with Close

Render workspace tabs from the journey state, with × buttons to close workspaces:

```tsx
function WorkspaceTabs() {
  const { workspaces, activeWorkspaceId } = useJourney();
  const { focusWorkspace, closeWorkspace } = useJourneyNavigate();

  return workspaces.map(workspace => (
    <div key={workspace.id} data-active={workspace.id === activeWorkspaceId}>
      <button onClick={() => focusWorkspace(workspace.id)}>
        {workspace.title} ({workspace.steps.length})
      </button>
      <button onClick={() => closeWorkspace(workspace.id)}>×</button>
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

### Main Menu with Persistent Workspaces

Top-level navigation that reuses existing workspaces instead of spawning duplicates:

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

`openOrFocus` finds the existing workspace for a domain, while `openFresh` always creates a new one. Click "Devices" twice? Same workspace. Click "New Asset" twice? Two independent workspaces.

### Overriding Significance on Dashboard Pages

Some pages like dashboards or search results link into multiple domains. Without overrides, every link would create a new workspace. Use `false` to keep the user in the current workspace:

```tsx
// From a dashboard — extend the current workspace, don't start a new one
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

The guard fires on destructive actions — `goBack()` and `closeWorkspace()`. Navigating to other workspaces, focusing workspaces, or pushing new steps does not trigger the guard, since those transitions are non-destructive.

### Preserving Form State Across Workspace Switches

When a user switches workspaces, React unmounts the inactive workspace's components. If a form has unsaved changes, that state is lost by default.

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

The `step.id` is unique per visit — so three `/assets/new` forms open in three different workspaces each get their own isolated draft. This works with any storage mechanism: `sessionStorage`, TanStack Query cache, Zustand, or a simple React context.

### Integration with React Router v6

Journey Stack manages workspace state independently. It does not import or wrap React Router. You connect the two by calling Journey Stack's navigation functions alongside React Router's:

```tsx
import { useNavigate } from 'react-router-dom';
import { useJourneyNavigate } from 'journey-stack';

function useAppNavigate() {
  const routerNavigate = useNavigate();
  const { navigate, replace, openFresh, openOrFocus, goBack, closeWorkspace, focusWorkspace } = useJourneyNavigate();

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

This thin wrapper keeps the two systems in sync while leaving Journey Stack decoupled from any routing library. For backward navigation (`back`, `closeWorkspace`, `focusWorkspace`), you typically only call journey-stack and let a sync effect update the router — see the example app for a full bidirectional sync implementation.

## Design Philosophy

Journey Stack is **headless**. It manages workspace state and navigation logic. It renders nothing. You build your own tabs, breadcrumbs, sidebars, and back buttons — the library gives you the data and gestures to power them.

This means:
- No CSS to override
- No components to style
- No opinions on layout
- Works with any UI framework on top of React
- Total control over every pixel

The library is opinionated about the **model** (workspaces, steps, significance) and unopinionated about the **presentation** (tabs, breadcrumbs, panels).

## License

MIT
