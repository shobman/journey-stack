import type {
  JourneyAction,
  JourneyWorkspace,
  JourneyConfig,
  JourneyStep,
  JourneyState,
} from "./types";
import { extractDomain, resolveSignificance } from "./significance";

let workspaceCounter = 0;

export function generateWorkspaceId(): string {
  return `ws_${++workspaceCounter}_${Date.now()}`;
}

/** Reset counter — useful for tests. */
export function resetWorkspaceCounter(): void {
  workspaceCounter = 0;
}

function createStep(path: string, label: string): JourneyStep {
  return { id: crypto.randomUUID(), path, label, timestamp: Date.now() };
}

function createWorkspace(path: string, label: string): JourneyWorkspace {
  const step = createStep(path, label);
  return {
    id: generateWorkspaceId(),
    title: label,
    domain: extractDomain(path),
    steps: [step],
  };
}

function createDefaultWorkspace(config: JourneyConfig): JourneyWorkspace {
  const path = config.homePath ?? "/";
  const label = config.homeLabel ?? "Home";
  return createWorkspace(path, label);
}

function activeFromFocusStack(focusStack: string[]): string {
  return focusStack[focusStack.length - 1];
}

function getActiveWorkspace(state: JourneyState): JourneyWorkspace | undefined {
  return state.workspaces.find((c) => c.id === state.activeWorkspaceId);
}

function getCurrentStep(workspace: JourneyWorkspace): JourneyStep | undefined {
  return workspace.steps[workspace.steps.length - 1];
}

function replaceWorkspace(
  state: JourneyState,
  workspaceId: string,
  updater: (workspace: JourneyWorkspace) => JourneyWorkspace,
): JourneyState {
  return {
    ...state,
    workspaces: state.workspaces.map((c) =>
      c.id === workspaceId ? updater(c) : c,
    ),
  };
}

export function createInitialState(config: JourneyConfig): JourneyState {
  const workspace = createDefaultWorkspace(config);
  return {
    workspaces: [workspace],
    focusStack: [workspace.id],
    activeWorkspaceId: workspace.id,
  };
}

export function journeyReducer(
  state: JourneyState,
  action: JourneyAction,
  config: JourneyConfig,
): JourneyState {
  switch (action.type) {
    case "NAVIGATE": {
      const active = getActiveWorkspace(state);
      if (!active) return state;

      const currentStep = getCurrentStep(active);

      // Deduplicate: navigating to current path is a no-op
      if (currentStep && currentStep.path === action.path) {
        return state;
      }

      const currentPath = currentStep?.path ?? "/";
      const isSignificant = resolveSignificance(
        action.significant,
        config.mode,
        currentPath,
        action.path,
        config.domains,
      );

      if (isSignificant) {
        // Start a new workspace
        const newWorkspace = createWorkspace(action.path, action.label);
        const newFocusStack = [...state.focusStack, newWorkspace.id];

        return {
          ...state,
          workspaces: [...state.workspaces, newWorkspace],
          focusStack: newFocusStack,
          activeWorkspaceId: activeFromFocusStack(newFocusStack),
        };
      }

      // Extend current workspace
      return replaceWorkspace(state, active.id, (workspace) => ({
        ...workspace,
        steps: [...workspace.steps, createStep(action.path, action.label)],
      }));
    }

    case "REPLACE": {
      const active = getActiveWorkspace(state);
      if (!active || active.steps.length === 0) return state;

      // Swap current step in place
      return replaceWorkspace(state, active.id, (workspace) => ({
        ...workspace,
        steps: [
          ...workspace.steps.slice(0, -1),
          createStep(action.path, action.label),
        ],
      }));
    }

    case "OPEN_FRESH": {
      // Always creates a new workspace regardless of significance
      const newWorkspace = createWorkspace(action.path, action.label);
      const newFocusStack = [...state.focusStack, newWorkspace.id];

      return {
        ...state,
        workspaces: [...state.workspaces, newWorkspace],
        focusStack: newFocusStack,
        activeWorkspaceId: activeFromFocusStack(newFocusStack),
      };
    }

    case "GO_BACK": {
      const active = getActiveWorkspace(state);
      if (!active) return state;

      const count = action.count ?? 1;
      const remaining = active.steps.length - count;

      if (remaining >= 1) {
        // Pop count steps — keep first `remaining` steps
        return replaceWorkspace(state, active.id, (workspace) => ({
          ...workspace,
          steps: workspace.steps.slice(0, remaining),
        }));
      }

      // count >= steps → close workspace
      if (state.workspaces.length <= 1) {
        // Last workspace — replace with default/home workspace
        const defaultWorkspace = createWorkspace(
          config.homePath ?? "/",
          config.homeLabel ?? "Home",
        );
        const newFocusStack = [defaultWorkspace.id];
        return {
          ...state,
          workspaces: [defaultWorkspace],
          focusStack: newFocusStack,
          activeWorkspaceId: activeFromFocusStack(newFocusStack),
        };
      }

      const remainingWorkspaces = state.workspaces.filter((c) => c.id !== active.id);
      const newFocusStack = state.focusStack.filter((id) => id !== active.id);

      return {
        ...state,
        workspaces: remainingWorkspaces,
        focusStack: newFocusStack,
        activeWorkspaceId: activeFromFocusStack(newFocusStack),
      };
    }

    case "OPEN_OR_FOCUS": {
      const targetDomain = extractDomain(action.path);

      // Look for an existing workspace whose domain matches
      const existing = state.workspaces.find((c) => c.domain === targetDomain);

      if (existing) {
        // Focus existing — move to end of focusStack, workspaces unchanged
        if (existing.id === state.activeWorkspaceId) return state;
        const newFocusStack = [
          ...state.focusStack.filter((id) => id !== existing.id),
          existing.id,
        ];
        return {
          ...state,
          focusStack: newFocusStack,
          activeWorkspaceId: activeFromFocusStack(newFocusStack),
        };
      }

      // No matching workspace — create one
      const newWorkspace = createWorkspace(action.path, action.label);
      const newFocusStack = [...state.focusStack, newWorkspace.id];
      return {
        ...state,
        workspaces: [...state.workspaces, newWorkspace],
        focusStack: newFocusStack,
        activeWorkspaceId: activeFromFocusStack(newFocusStack),
      };
    }

    case "CLOSE_WORKSPACE": {
      const workspaceToClose = state.workspaces.find(
        (c) => c.id === action.workspaceId,
      );
      if (!workspaceToClose) return state;

      if (state.workspaces.length <= 1) {
        // Last workspace — replace with default/home workspace
        const defaultWorkspace = createWorkspace(
          config.homePath ?? "/",
          config.homeLabel ?? "Home",
        );
        const newFocusStack = [defaultWorkspace.id];
        return {
          ...state,
          workspaces: [defaultWorkspace],
          focusStack: newFocusStack,
          activeWorkspaceId: activeFromFocusStack(newFocusStack),
        };
      }

      const remainingWorkspaces = state.workspaces.filter(
        (c) => c.id !== action.workspaceId,
      );
      const newFocusStack = state.focusStack.filter(
        (id) => id !== action.workspaceId,
      );

      return {
        ...state,
        workspaces: remainingWorkspaces,
        focusStack: newFocusStack,
        activeWorkspaceId: activeFromFocusStack(newFocusStack),
      };
    }

    case "FOCUS_WORKSPACE": {
      const target = state.workspaces.find((c) => c.id === action.workspaceId);
      if (!target || target.id === state.activeWorkspaceId) return state;
      // Move to end of focusStack — workspaces array unchanged
      const newFocusStack = [
        ...state.focusStack.filter((id) => id !== target.id),
        target.id,
      ];
      return {
        ...state,
        focusStack: newFocusStack,
        activeWorkspaceId: activeFromFocusStack(newFocusStack),
      };
    }

    default:
      return state;
  }
}
