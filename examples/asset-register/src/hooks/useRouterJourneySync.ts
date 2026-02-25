import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useJourney, useJourneyNavigate, useCurrentStep } from "journey-stack";
import type { HistoryStateData } from "./SyncContext";

/**
 * Computes total step depth across all workspaces.
 */
function computeDepth(workspaces: { steps: unknown[] }[]): number {
  return workspaces.reduce((sum, ws) => sum + ws.steps.length, 0);
}

/**
 * Bridge between React Router and journey-stack.
 *
 * Replaces useJourneyBrowserSync for the React Router integration.
 * Returns refs that useAppNavigate consumes via SyncContext.
 */
export function useRouterJourneySync() {
  const { workspaces, activeWorkspaceId } = useJourney();
  const step = useCurrentStep();
  const { navigate: journeyNavigate, goBack, focusWorkspace } = useJourneyNavigate();

  const routerNavigate = useNavigate();
  const location = useLocation();

  // --- Suppress refs ---
  // suppressRouterSync: set before dispatching journey actions from location changes,
  //   prevents state-watcher from double-syncing Router
  // suppressLocationDispatch: set before calling routerNavigate from state changes,
  //   prevents location-watcher from double-dispatching journey actions
  const suppressRouterSync = useRef(false);
  const suppressLocationDispatch = useRef(false);

  // --- Tracking refs ---
  const positionRef = useRef(0);
  const depthRef = useRef(computeDepth(workspaces));
  const stepIdRef = useRef(step?.id ?? "");
  const workspaceIdRef = useRef(activeWorkspaceId);

  // Live refs for use in effects
  const workspacesRef = useRef(workspaces);
  workspacesRef.current = workspaces;
  const activeWorkspaceIdRef = useRef(activeWorkspaceId);
  activeWorkspaceIdRef.current = activeWorkspaceId;
  const stepRef = useRef(step);
  stepRef.current = step;

  const getJourneyState = useCallback(() => ({
    workspaceId: activeWorkspaceIdRef.current,
    path: stepRef.current?.path ?? "/dashboard",
    label: stepRef.current?.label ?? "Dashboard",
  }), []);

  function makeEntry(overrides?: Partial<HistoryStateData>): HistoryStateData {
    return {
      _journeySync: true,
      position: positionRef.current,
      workspaceId: activeWorkspaceIdRef.current,
      path: stepRef.current?.path ?? "/dashboard",
      label: stepRef.current?.label ?? "Dashboard",
      ...overrides,
    };
  }

  // --- Effect 1: Mount — seed location state ---
  useEffect(() => {
    const initialPath = location.pathname.replace(/^\/journey-stack/, "") || "/dashboard";

    if (initialPath !== "/dashboard" && initialPath !== "/") {
      // Deep link: extract a label from the path
      const segments = initialPath.split("/").filter(Boolean);
      const label = segments.length > 1
        ? `${segments[0].charAt(0).toUpperCase() + segments[0].slice(1)} ${segments[1]}`
        : segments[0].charAt(0).toUpperCase() + segments[0].slice(1);

      suppressRouterSync.current = true;
      journeyNavigate(initialPath, label);
    }

    // Replace current entry with journey state
    routerNavigate(
      stepRef.current?.path ?? initialPath,
      {
        replace: true,
        state: makeEntry(),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Effect 2: State watcher — journey state → Router ---
  useEffect(() => {
    const newDepth = computeDepth(workspaces);
    const newStepId = step?.id ?? "";
    const newWorkspaceId = activeWorkspaceId;

    if (suppressRouterSync.current) {
      suppressRouterSync.current = false;
      depthRef.current = newDepth;
      stepIdRef.current = newStepId;
      workspaceIdRef.current = newWorkspaceId;
      return;
    }

    const oldDepth = depthRef.current;
    const oldWorkspaceId = workspaceIdRef.current;
    const oldStepId = stepIdRef.current;

    const currentPath = step?.path ?? "/dashboard";

    if (newDepth > oldDepth) {
      // Forward: new step or new workspace — push
      positionRef.current++;
      suppressLocationDispatch.current = true;
      routerNavigate(currentPath, {
        state: makeEntry({ position: positionRef.current }),
      });
    } else if (newDepth < oldDepth) {
      // Backward: step popped or workspace closed — go back in Router
      const delta = oldDepth - newDepth;
      positionRef.current -= delta;
      suppressLocationDispatch.current = true;
      routerNavigate(-delta);
    } else if (newWorkspaceId !== oldWorkspaceId) {
      // Same depth, different workspace — workspace focus/switch — push
      positionRef.current++;
      suppressLocationDispatch.current = true;
      routerNavigate(currentPath, {
        state: makeEntry({ position: positionRef.current }),
      });
    } else if (newStepId !== oldStepId) {
      // Same depth, same workspace, different step — replace (swap)
      suppressLocationDispatch.current = true;
      routerNavigate(currentPath, {
        replace: true,
        state: makeEntry(),
      });
    }

    depthRef.current = newDepth;
    stepIdRef.current = newStepId;
    workspaceIdRef.current = newWorkspaceId;
  }, [workspaces, activeWorkspaceId, step, routerNavigate]);

  // --- Effect 3: Location watcher — Router → journey state ---
  useEffect(() => {
    if (suppressLocationDispatch.current) {
      suppressLocationDispatch.current = false;
      return;
    }

    const data = location.state as HistoryStateData | null;
    if (!data || !data._journeySync) return;

    const incoming = data.position;
    const current = positionRef.current;
    const goingBack = incoming < current;

    positionRef.current = incoming;

    // Check if the workspace still exists
    const workspaceExists = workspacesRef.current.some(
      (c) => c.id === data.workspaceId,
    );

    if (!workspaceExists) {
      // Workspace was closed — skip by continuing in same direction
      if (goingBack) {
        routerNavigate(-1);
      } else {
        routerNavigate(1);
      }
      return;
    }

    suppressRouterSync.current = true;

    if (data.workspaceId !== activeWorkspaceIdRef.current) {
      // Different workspace — focus it
      focusWorkspace(data.workspaceId);
    } else if (goingBack) {
      // Same workspace, going back — pop step
      goBack();
    } else {
      // Same workspace, going forward — recreate step
      journeyNavigate(data.path, data.label);
    }
  }, [location, routerNavigate, focusWorkspace, goBack, journeyNavigate]);

  return {
    suppressRouterSync,
    suppressLocationDispatch,
    positionRef,
    getJourneyState,
  };
}
