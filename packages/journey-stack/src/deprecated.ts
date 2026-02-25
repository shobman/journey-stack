import type {
  JourneyWorkspace,
  CloseWorkspaceAction,
  FocusWorkspaceAction,
} from "./types";
import { useActiveWorkspace } from "./hooks";

/** @deprecated Use JourneyWorkspace instead */
export type JourneyChapter = JourneyWorkspace;

/** @deprecated Use CloseWorkspaceAction instead */
export type CloseChapterAction = CloseWorkspaceAction;

/** @deprecated Use FocusWorkspaceAction instead */
export type FocusChapterAction = FocusWorkspaceAction;

/** @deprecated Use useActiveWorkspace instead */
export const useActiveChapter = useActiveWorkspace;
