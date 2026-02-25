import { useCallback, useMemo, useReducer, useRef, type ReactNode } from "react";
import { JourneyContext, type JourneyContextValue } from "./context";
import { createInitialState, journeyReducer } from "./reducer";
import type {
  BlockerAction,
  JourneyAction,
  JourneyBlockerFn,
  JourneyConfig,
  JourneyMode,
  JourneyState,
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
export function classifyGoBack(
  state: JourneyState,
  count = 1,
): BlockerAction | null {
  const active = state.workspaces.find((c) => c.id === state.activeWorkspaceId);
  if (!active) return null;

  if (active.steps.length > count) {
    return { type: "back", workspaceId: active.id };
  }

  // count >= steps → would close the workspace
  if (state.workspaces.length <= 1) {
    return { type: "closeAll", workspaceId: active.id };
  }

  return { type: "close", workspaceId: active.id };
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
        const blockerAction = classifyGoBack(stateRef.current, action.count);
        if (blockerAction) {
          const allAllowed = [...blockers].every((fn) => fn(blockerAction));
          if (!allAllowed) return;
        }
      }

      if (action.type === "CLOSE_WORKSPACE" && blockers.size > 0) {
        const isLast = stateRef.current.workspaces.length <= 1;
        const blockerAction: BlockerAction = {
          type: isLast ? "closeAll" : "close",
          workspaceId: action.workspaceId,
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
