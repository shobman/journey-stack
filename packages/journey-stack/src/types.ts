export type JourneyStep = {
  id: string;
  path: string;
  label: string;
  timestamp: number;
};

export type JourneyChapter = {
  id: string;
  title: string;
  domain: string;
  steps: JourneyStep[];
};

export type JourneyWorkspace = {
  chapters: JourneyChapter[];
  activeChapterId: string;
};

export type JourneyMode = "trail" | "chapters" | "route-derived";

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
};

export type OpenOrFocusAction = {
  type: "OPEN_OR_FOCUS";
  path: string;
  label: string;
};

export type GoToStepAction = {
  type: "GO_TO_STEP";
  chapterId: string;
  stepIndex: number;
};

export type CloseChapterAction = {
  type: "CLOSE_CHAPTER";
  chapterId: string;
};

export type JourneyAction =
  | NavigateAction
  | ReplaceAction
  | OpenFreshAction
  | GoBackAction
  | OpenOrFocusAction
  | GoToStepAction
  | CloseChapterAction;

// --- Navigation guards ---

export type BlockerAction = {
  type: "back" | "close" | "closeAll";
  chapterId: string;
};

export type JourneyBlockerFn = (action: BlockerAction) => boolean;
