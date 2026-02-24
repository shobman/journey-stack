import { createContext, type MutableRefObject } from "react";

export type HistoryStateData = {
  _journeySync: true;
  position: number;
  chapterId: string;
  path: string;
  label: string;
};

export type SyncContextValue = {
  suppressRouterSync: MutableRefObject<boolean>;
  suppressLocationDispatch: MutableRefObject<boolean>;
  positionRef: MutableRefObject<number>;
  getJourneyState: () => {
    chapterId: string;
    path: string;
    label: string;
  };
};

export const SyncContext = createContext<SyncContextValue>(null!);
