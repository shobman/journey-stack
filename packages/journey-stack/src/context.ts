import { createContext, type MutableRefObject } from "react";
import type {
  JourneyAction,
  JourneyBlockerFn,
  JourneyConfig,
  JourneyState,
} from "./types";

export type JourneyContextValue = {
  state: JourneyState;
  dispatch: (action: JourneyAction) => void;
  config: JourneyConfig;
  blockersRef: MutableRefObject<Set<JourneyBlockerFn>>;
};

export const JourneyContext = createContext<JourneyContextValue | null>(null);
