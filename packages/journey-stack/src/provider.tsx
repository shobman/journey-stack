import { useCallback, useMemo, useReducer, useRef, type ReactNode } from "react";
import { JourneyContext, type JourneyContextValue } from "./context";
import { createInitialState, journeyReducer } from "./reducer";
import type {
  BlockerAction,
  JourneyAction,
  JourneyBlockerFn,
  JourneyConfig,
  JourneyMode,
  JourneyWorkspace,
} from "./types";

export type JourneyProviderProps = {
  mode?: JourneyMode;
  domains?: string[];
  homePath?: string;
  homeLabel?: string;
  children: ReactNode;
};

/**
 * Classifies a GO_BACK action into a consumer-facing BlockerAction
 * by inspecting the current workspace state.
 */
export function classifyGoBack(state: JourneyWorkspace): BlockerAction | null {
  const active = state.chapters.find((c) => c.id === state.activeChapterId);
  if (!active) return null;

  if (active.steps.length > 1) {
    return { type: "back", chapterId: active.id };
  }

  if (state.chapters.length <= 1) {
    return { type: "closeAll", chapterId: active.id };
  }

  return { type: "close", chapterId: active.id };
}

export function JourneyProvider({
  mode = "trail",
  domains,
  homePath,
  homeLabel,
  children,
}: JourneyProviderProps) {
  const config = useMemo<JourneyConfig>(
    () => ({ mode, domains, homePath, homeLabel }),
    [mode, domains, homePath, homeLabel],
  );

  const [state, rawDispatch] = useReducer(
    (s: ReturnType<typeof createInitialState>, a: JourneyAction) =>
      journeyReducer(s, a, config),
    config,
    createInitialState,
  );

  const blockersRef = useRef<Set<JourneyBlockerFn>>(new Set());

  // State ref so the stable dispatch callback always reads latest state
  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback(
    (action: JourneyAction) => {
      const blockers = blockersRef.current;

      if (action.type === "GO_BACK" && blockers.size > 0) {
        const blockerAction = classifyGoBack(stateRef.current);
        if (blockerAction) {
          const allAllowed = [...blockers].every((fn) => fn(blockerAction));
          if (!allAllowed) return;
        }
      }

      if (action.type === "GO_TO_STEP" && blockers.size > 0) {
        const active = stateRef.current.chapters.find(
          (c) => c.id === stateRef.current.activeChapterId,
        );
        if (active && action.chapterId === active.id) {
          const blockerAction: BlockerAction = {
            type: "back",
            chapterId: active.id,
          };
          const allAllowed = [...blockers].every((fn) => fn(blockerAction));
          if (!allAllowed) return;
        }
      }

      if (action.type === "CLOSE_CHAPTER" && blockers.size > 0) {
        const isLast = stateRef.current.chapters.length <= 1;
        const blockerAction: BlockerAction = {
          type: isLast ? "closeAll" : "close",
          chapterId: action.chapterId,
        };
        const allAllowed = [...blockers].every((fn) => fn(blockerAction));
        if (!allAllowed) return;
      }

      rawDispatch(action);
    },
    [],
  );

  const value = useMemo<JourneyContextValue>(
    () => ({ state, dispatch, config, blockersRef }),
    [state, dispatch, config],
  );

  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  );
}
