import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { JourneyContext } from "./context";
import type {
  JourneyBlockerFn,
  JourneyChapter,
  JourneyStep,
  JourneyWorkspace,
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
 * Returns the full workspace state.
 */
export function useJourney(): JourneyWorkspace {
  return useJourneyContext().state;
}

/**
 * Returns the currently active chapter.
 */
export function useActiveChapter(): JourneyChapter | undefined {
  const { state } = useJourneyContext();
  return useMemo(
    () => state.chapters.find((c) => c.id === state.activeChapterId),
    [state.chapters, state.activeChapterId],
  );
}

/**
 * Returns the current step (top of the active chapter's stack).
 */
export function useCurrentStep(): JourneyStep | undefined {
  const chapter = useActiveChapter();
  return useMemo(
    () => (chapter ? chapter.steps[chapter.steps.length - 1] : undefined),
    [chapter],
  );
}

export type JourneyNavigateFns = {
  navigate: (path: string, label: string, options?: NavigateOptions) => void;
  replace: (path: string, label: string) => void;
  openFresh: (path: string, label: string) => void;
  openOrFocus: (path: string, label: string) => void;
  goBack: () => void;
  goToStep: (chapterId: string, stepIndex: number) => void;
  closeChapter: (chapterId: string) => void;
};

/**
 * Returns navigation functions: navigate, replace, openFresh, openOrFocus, goBack, goToStep, closeChapter.
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

  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), [dispatch]);

  const goToStep = useCallback(
    (chapterId: string, stepIndex: number) =>
      dispatch({ type: "GO_TO_STEP", chapterId, stepIndex }),
    [dispatch],
  );

  const closeChapter = useCallback(
    (chapterId: string) =>
      dispatch({ type: "CLOSE_CHAPTER", chapterId }),
    [dispatch],
  );

  return useMemo(
    () => ({ navigate, replace, openFresh, openOrFocus, goBack, goToStep, closeChapter }),
    [navigate, replace, openFresh, openOrFocus, goBack, goToStep, closeChapter],
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
