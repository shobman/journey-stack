// Types
export type {
  JourneyStep,
  JourneyChapter,
  JourneyWorkspace,
  JourneyMode,
  JourneyConfig,
  JourneyAction,
  NavigateAction,
  NavigateOptions,
  ReplaceAction,
  OpenFreshAction,
  GoBackAction,
  OpenOrFocusAction,
  CloseChapterAction,
  FocusChapterAction,
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
  useActiveChapter,
  useCurrentStep,
  useJourneyNavigate,
  useJourneyBlock,
  useJourneyBrowserSync,
} from "./hooks";
export type { JourneyNavigateFns } from "./hooks";

// Components
export { JourneyLink } from "./journey-link";
export type { JourneyLinkProps, JourneyLinkRenderProps } from "./journey-link";

// Utilities (for advanced usage / testing)
export { resolveSignificance, extractDomain } from "./significance";
export { classifyGoBack } from "./provider";
