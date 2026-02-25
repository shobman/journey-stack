export type JourneyStep = {
  id: string;
  path: string;
  label: string;
  timestamp: number;
};

export type JourneyWorkspace = {
  id: string;
  title: string;
  domain: string;
  steps: JourneyStep[];
};

export type JourneyState = {
  workspaces: JourneyWorkspace[];
  focusStack: string[];
  activeWorkspaceId: string;
};

export type JourneyMode = "trail" | "workspaces" | "route-derived";

export type SignificanceResult = boolean | undefined;

export type JourneyConfig = {
  mode: JourneyMode;
  domains?: string[];
  homePath?: string;
  homeLabel?: string;
};

export type NavigateOptions = {
  significant?: boolean;
};

// --- Actions ---

export type NavigateAction = {
  type: "NAVIGATE";
  path: string;
  label: string;
  significant?: boolean;
};

export type ReplaceAction = {
  type: "REPLACE";
  path: string;
  label: string;
};

export type OpenFreshAction = {
  type: "OPEN_FRESH";
  path: string;
  label: string;
};

export type GoBackAction = {
  type: "GO_BACK";
  count?: number;
};

export type OpenOrFocusAction = {
  type: "OPEN_OR_FOCUS";
  path: string;
  label: string;
};

export type CloseWorkspaceAction = {
  type: "CLOSE_WORKSPACE";
  workspaceId: string;
};

export type FocusWorkspaceAction = {
  type: "FOCUS_WORKSPACE";
  workspaceId: string;
};

export type JourneyAction =
  | NavigateAction
  | ReplaceAction
  | OpenFreshAction
  | GoBackAction
  | OpenOrFocusAction
  | CloseWorkspaceAction
  | FocusWorkspaceAction;

// --- Navigation guards ---

export type BlockerAction = {
  type: "back" | "close" | "closeAll";
  workspaceId: string;
};

export type JourneyBlockerFn = (action: BlockerAction) => boolean;
