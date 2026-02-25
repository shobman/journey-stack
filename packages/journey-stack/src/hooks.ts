import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { JourneyContext } from "./context";
import { resolveSignificance } from "./significance";
import type {
  JourneyBlockerFn,
  JourneyWorkspace,
  JourneyStep,
  JourneyState,
  NavigateOptions,
} from "./types";

function useJourneyContext() {
  const ctx = useContext(JourneyContext);
  if (!ctx) {
    throw new Error("useJourney* hooks must be used within a <JourneyProvider>");
  }
  return ctx;
}

/**
 * Returns the full journey state.
 */
export function useJourney(): JourneyState {
  return useJourneyContext().state;
}

/**
 * Returns the currently active workspace.
 */
export function useActiveWorkspace(): JourneyWorkspace | undefined {
  const { state } = useJourneyContext();
  return useMemo(
    () => state.workspaces.find((c) => c.id === state.activeWorkspaceId),
    [state.workspaces, state.activeWorkspaceId],
  );
}

/**
 * Returns the current step (top of the active workspace's stack).
 */
export function useCurrentStep(): JourneyStep | undefined {
  const workspace = useActiveWorkspace();
  return useMemo(
    () => (workspace ? workspace.steps[workspace.steps.length - 1] : undefined),
    [workspace],
  );
}

export type JourneyNavigateFns = {
  navigate: (path: string, label: string, options?: NavigateOptions) => void;
  replace: (path: string, label: string) => void;
  openFresh: (path: string, label: string) => void;
  openOrFocus: (path: string, label: string) => void;
  goBack: (count?: number) => void;
  closeWorkspace: (workspaceId: string) => void;
  focusWorkspace: (workspaceId: string) => void;
  /** @deprecated Use closeWorkspace */
  closeChapter: (workspaceId: string) => void;
  /** @deprecated Use focusWorkspace */
  focusChapter: (workspaceId: string) => void;
};

/**
 * Returns navigation functions: navigate, replace, openFresh, openOrFocus, goBack, closeWorkspace, focusWorkspace.
 */
export function useJourneyNavigate(): JourneyNavigateFns {
  const { dispatch } = useJourneyContext();

  const navigate = useCallback(
    (path: string, label: string, options?: NavigateOptions) =>
      dispatch({ type: "NAVIGATE", path, label, significant: options?.significant }),
    [dispatch],
  );

  const replace = useCallback(
    (path: string, label: string) =>
      dispatch({ type: "REPLACE", path, label }),
    [dispatch],
  );

  const openFresh = useCallback(
    (path: string, label: string) =>
      dispatch({ type: "OPEN_FRESH", path, label }),
    [dispatch],
  );

  const openOrFocus = useCallback(
    (path: string, label: string) =>
      dispatch({ type: "OPEN_OR_FOCUS", path, label }),
    [dispatch],
  );

  const goBack = useCallback(
    (count?: number) => dispatch({ type: "GO_BACK", count }),
    [dispatch],
  );

  const closeWorkspace = useCallback(
    (workspaceId: string) =>
      dispatch({ type: "CLOSE_WORKSPACE", workspaceId }),
    [dispatch],
  );

  const focusWorkspace = useCallback(
    (workspaceId: string) =>
      dispatch({ type: "FOCUS_WORKSPACE", workspaceId }),
    [dispatch],
  );

  return useMemo(
    () => ({
      navigate, replace, openFresh, openOrFocus, goBack,
      closeWorkspace, focusWorkspace,
      closeChapter: closeWorkspace,
      focusChapter: focusWorkspace,
    }),
    [navigate, replace, openFresh, openOrFocus, goBack, closeWorkspace, focusWorkspace],
  );
}

/**
 * Registers a navigation guard that intercepts destructive actions
 * (back, close, closeAll). The blocker receives a BlockerAction and
 * must return true to allow the navigation, or false to block it.
 *
 * Multiple blockers can be active simultaneously — ALL must return
 * true for the action to proceed.
 *
 * The blocker is automatically unregistered when the component unmounts.
 */
export function useJourneyBlock(blocker: JourneyBlockerFn): void {
  const { blockersRef } = useJourneyContext();

  const blockerRef = useRef(blocker);
  blockerRef.current = blocker;

  const stableBlocker = useCallback<JourneyBlockerFn>(
    (action) => blockerRef.current(action),
    [],
  );

  useEffect(() => {
    blockersRef.current.add(stableBlocker);
    return () => {
      blockersRef.current.delete(stableBlocker);
    };
  }, [blockersRef, stableBlocker]);
}

/**
 * Returns true if navigating to `path` would create a new workspace,
 * false if it would extend the current workspace.
 *
 * Uses the same significance resolution as navigate():
 * 1. If significant is true → return true
 * 2. If significant is false → return false
 * 3. If undefined → resolve from mode (trail always false,
 *    workspaces compares domains of current path vs target path)
 *
 * Pure read, no side effects.
 */
export function useWillBranch(path: string, significant?: boolean): boolean {
  const { state, config } = useJourneyContext();
  const active = state.workspaces.find((c) => c.id === state.activeWorkspaceId);
  const currentPath = active?.steps[active.steps.length - 1]?.path ?? "/";
  return resolveSignificance(
    significant,
    config.mode,
    currentPath,
    path,
    config.domains,
  );
}

// --- Browser history sync ---

type HistoryStateData = {
  _journeySync: true;
  position: number;
  workspaceId: string;
  path: string;
  label: string;
};

function computeDepth(state: JourneyState): number {
  return state.workspaces.reduce((sum, ch) => sum + ch.steps.length, 0);
}

function getActiveTopStep(state: JourneyState): JourneyStep | undefined {
  const workspace = state.workspaces.find((c) => c.id === state.activeWorkspaceId);
  return workspace ? workspace.steps[workspace.steps.length - 1] : undefined;
}

/**
 * Syncs journey state with the browser History API so that the
 * browser back/forward buttons mirror journey navigation.
 *
 * Each history entry stores the active workspace's ID. On popstate:
 * - If the entry's workspace differs from the current → focus that workspace
 * - If same workspace, going back → GO_BACK (pop step)
 * - If same workspace, going forward → NAVIGATE (recreate step)
 * - If the workspace no longer exists → skip (keep going in same direction)
 *
 * Call once inside the `<JourneyProvider>` tree:
 *
 *   function App() {
 *     useJourneyBrowserSync();
 *     return <PageRouter />;
 *   }
 */
export function useJourneyBrowserSync(): void {
  if (typeof window === "undefined") return;

  const { state, dispatch } = useJourneyContext();

  const positionRef = useRef(0);
  const depthRef = useRef(computeDepth(state));
  const stepIdRef = useRef(getActiveTopStep(state)?.id ?? "");
  const workspaceIdRef = useRef(state.activeWorkspaceId);

  // Suppress flags to break feedback loops
  const suppressPushRef = useRef(false); // prevents state→browser sync
  const suppressPopRef = useRef(false); // prevents browser→journey sync

  // Keep a live ref to state for the popstate handler
  const stateRef = useRef(state);
  stateRef.current = state;

  function makeEntry(overrides?: Partial<HistoryStateData>): HistoryStateData {
    const topStep = getActiveTopStep(state);
    return {
      _journeySync: true,
      position: positionRef.current,
      workspaceId: state.activeWorkspaceId,
      path: topStep?.path ?? "/",
      label: topStep?.label ?? "Home",
      ...overrides,
    };
  }

  // Initialize history state on mount
  useEffect(() => {
    const topStep = getActiveTopStep(state);
    const data: HistoryStateData = {
      _journeySync: true,
      position: 0,
      workspaceId: state.activeWorkspaceId,
      path: topStep?.path ?? "/",
      label: topStep?.label ?? "Home",
    };
    history.replaceState(data, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (suppressPopRef.current) {
        suppressPopRef.current = false;
        return;
      }

      const data = event.state as HistoryStateData | null;
      if (!data || !data._journeySync) return;

      const incoming = data.position;
      const current = positionRef.current;
      const goingBack = incoming < current;

      positionRef.current = incoming;

      // Check if the workspace still exists
      const workspaceExists = stateRef.current.workspaces.some(
        (c) => c.id === data.workspaceId,
      );

      if (!workspaceExists) {
        // Workspace was closed — skip this entry
        if (goingBack) {
          history.back();
        } else {
          history.forward();
        }
        return;
      }

      suppressPushRef.current = true;

      if (data.workspaceId !== stateRef.current.activeWorkspaceId) {
        // Different workspace — focus it
        dispatch({ type: "FOCUS_WORKSPACE", workspaceId: data.workspaceId });
      } else if (goingBack) {
        // Same workspace, going back — pop step
        dispatch({ type: "GO_BACK" });
      } else {
        // Same workspace, going forward — recreate step
        dispatch({ type: "NAVIGATE", path: data.path, label: data.label });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [dispatch]);

  // Sync journey state changes to browser history
  useEffect(() => {
    const newDepth = computeDepth(state);
    const newStepId = getActiveTopStep(state)?.id ?? "";
    const newWorkspaceId = state.activeWorkspaceId;

    if (suppressPushRef.current) {
      suppressPushRef.current = false;
      depthRef.current = newDepth;
      stepIdRef.current = newStepId;
      workspaceIdRef.current = newWorkspaceId;
      return;
    }

    const oldDepth = depthRef.current;
    const oldStepId = stepIdRef.current;
    const oldWorkspaceId = workspaceIdRef.current;

    if (newDepth > oldDepth) {
      // Forward: new step or new workspace — push
      positionRef.current++;
      history.pushState(makeEntry({ position: positionRef.current }), "");
    } else if (newDepth < oldDepth) {
      // Backward: step popped or workspace closed — sync browser back
      const delta = oldDepth - newDepth;
      suppressPopRef.current = true;
      positionRef.current -= delta;
      history.go(-delta);
    } else if (newWorkspaceId !== oldWorkspaceId) {
      // Same depth, different workspace — workspace focus/switch — push
      positionRef.current++;
      history.pushState(makeEntry({ position: positionRef.current }), "");
    } else if (newStepId !== oldStepId) {
      // Same depth, same workspace, different step — replace in place
      history.replaceState(makeEntry(), "");
    }

    depthRef.current = newDepth;
    stepIdRef.current = newStepId;
    workspaceIdRef.current = newWorkspaceId;
  }, [state]);
}
