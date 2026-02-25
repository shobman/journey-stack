// Types
export type {
  JourneyStep,
  JourneyWorkspace,
  JourneyState,
  JourneyMode,
  JourneyConfig,
  JourneyAction,
  NavigateAction,
  NavigateOptions,
  ReplaceAction,
  OpenFreshAction,
  GoBackAction,
  OpenOrFocusAction,
  CloseWorkspaceAction,
  FocusWorkspaceAction,
  SignificanceResult,
  BlockerAction,
  JourneyBlockerFn,
} from "./types";

// Provider
export { JourneyProvider } from "./provider";
export type { JourneyProviderProps } from "./provider";

// Hooks
export {
  useJourney,
  useActiveWorkspace,
  useCurrentStep,
  useJourneyNavigate,
  useJourneyBlock,
  useJourneyBrowserSync,
  useWillBranch,
} from "./hooks";
export type { JourneyNavigateFns } from "./hooks";

// Components
export { JourneyLink } from "./journey-link";
export type { JourneyLinkProps, JourneyLinkRenderProps } from "./journey-link";

// Utilities (for advanced usage / testing)
export { resolveSignificance, extractDomain } from "./significance";
export { classifyGoBack } from "./provider";

// --- Deprecated aliases (remove in next major) ---
export type { JourneyChapter, CloseChapterAction, FocusChapterAction } from "./deprecated";
export { useActiveChapter } from "./deprecated";
