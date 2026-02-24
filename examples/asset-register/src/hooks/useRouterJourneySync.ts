import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useJourney, useJourneyNavigate, useCurrentStep } from "journey-stack";
import type { HistoryStateData } from "./SyncContext";

/**
 * Computes total step depth across all chapters.
 */
function computeDepth(chapters: { steps: unknown[] }[]): number {
  return chapters.reduce((sum, ch) => sum + ch.steps.length, 0);
}

/**
 * Bridge between React Router and journey-stack.
 *
 * Replaces useJourneyBrowserSync for the React Router integration.
 * Returns refs that useAppNavigate consumes via SyncContext.
 */
export function useRouterJourneySync() {
  const { chapters, activeChapterId } = useJourney();
  const step = useCurrentStep();
  const { navigate: journeyNavigate, goBack, focusChapter } = useJourneyNavigate();

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
  const depthRef = useRef(computeDepth(chapters));
  const stepIdRef = useRef(step?.id ?? "");
  const chapterIdRef = useRef(activeChapterId);

  // Live refs for use in effects
  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;
  const activeChapterIdRef = useRef(activeChapterId);
  activeChapterIdRef.current = activeChapterId;
  const stepRef = useRef(step);
  stepRef.current = step;

  const getJourneyState = useCallback(() => ({
    chapterId: activeChapterIdRef.current,
    path: stepRef.current?.path ?? "/dashboard",
    label: stepRef.current?.label ?? "Dashboard",
  }), []);

  function makeEntry(overrides?: Partial<HistoryStateData>): HistoryStateData {
    return {
      _journeySync: true,
      position: positionRef.current,
      chapterId: activeChapterIdRef.current,
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
    const newDepth = computeDepth(chapters);
    const newStepId = step?.id ?? "";
    const newChapterId = activeChapterId;

    if (suppressRouterSync.current) {
      suppressRouterSync.current = false;
      depthRef.current = newDepth;
      stepIdRef.current = newStepId;
      chapterIdRef.current = newChapterId;
      return;
    }

    const oldDepth = depthRef.current;
    const oldChapterId = chapterIdRef.current;
    const oldStepId = stepIdRef.current;

    const currentPath = step?.path ?? "/dashboard";

    if (newDepth > oldDepth) {
      // Forward: new step or new chapter — push
      positionRef.current++;
      suppressLocationDispatch.current = true;
      routerNavigate(currentPath, {
        state: makeEntry({ position: positionRef.current }),
      });
    } else if (newDepth < oldDepth) {
      // Backward: step popped or chapter closed — go back in Router
      const delta = oldDepth - newDepth;
      positionRef.current -= delta;
      suppressLocationDispatch.current = true;
      routerNavigate(-delta);
    } else if (newChapterId !== oldChapterId) {
      // Same depth, different chapter — chapter focus/switch — push
      positionRef.current++;
      suppressLocationDispatch.current = true;
      routerNavigate(currentPath, {
        state: makeEntry({ position: positionRef.current }),
      });
    } else if (newStepId !== oldStepId) {
      // Same depth, same chapter, different step — replace (swap)
      suppressLocationDispatch.current = true;
      routerNavigate(currentPath, {
        replace: true,
        state: makeEntry(),
      });
    }

    depthRef.current = newDepth;
    stepIdRef.current = newStepId;
    chapterIdRef.current = newChapterId;
  }, [chapters, activeChapterId, step, routerNavigate]);

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

    // Check if the chapter still exists
    const chapterExists = chaptersRef.current.some(
      (c) => c.id === data.chapterId,
    );

    if (!chapterExists) {
      // Chapter was closed — skip by continuing in same direction
      if (goingBack) {
        routerNavigate(-1);
      } else {
        routerNavigate(1);
      }
      return;
    }

    suppressRouterSync.current = true;

    if (data.chapterId !== activeChapterIdRef.current) {
      // Different chapter — focus it
      focusChapter(data.chapterId);
    } else if (goingBack) {
      // Same chapter, going back — pop step
      goBack();
    } else {
      // Same chapter, going forward — recreate step
      journeyNavigate(data.path, data.label);
    }
  }, [location, routerNavigate, focusChapter, goBack, journeyNavigate]);

  return {
    suppressRouterSync,
    suppressLocationDispatch,
    positionRef,
    getJourneyState,
  };
}
