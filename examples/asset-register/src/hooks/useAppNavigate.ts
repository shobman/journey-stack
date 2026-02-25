import { useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useJourneyNavigate } from "journey-stack";
import { SyncContext, type HistoryStateData } from "./SyncContext";

/**
 * Strips query string from a path so journey-stack sees a clean pathname
 * for domain extraction, while React Router gets the full URL.
 */
function splitPath(fullPath: string): [pathname: string, fullUrl: string] {
  const [pathname] = fullPath.split("?");
  return [pathname, fullPath];
}

/**
 * App-level navigation that coordinates journey-stack and React Router.
 *
 * For forward navigation (push, swap, fresh, openOrFocus): calls both
 * journey-stack and Router, with suppress flags to prevent double-sync.
 *
 * For backward navigation (back, closeWorkspace, focusWorkspace): calls only
 * journey-stack; the sync hook detects the state change and updates Router.
 */
export function useAppNavigate() {
  const {
    navigate: journeyNavigate,
    replace: journeyReplace,
    openFresh: journeyOpenFresh,
    openOrFocus: journeyOpenOrFocus,
    goBack: journeyGoBack,
    closeWorkspace: journeyCloseWorkspace,
    focusWorkspace: journeyFocusWorkspace,
  } = useJourneyNavigate();

  const routerNavigate = useNavigate();
  const { suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState } =
    useContext(SyncContext);

  const push = useCallback(
    (fullPath: string, label: string, opts?: { significant?: boolean }) => {
      const [pathname, fullUrl] = splitPath(fullPath);
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyNavigate(pathname, label, opts);
      positionRef.current++;
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path: fullUrl,
        label,
      };
      routerNavigate(fullUrl, { state });
    },
    [journeyNavigate, routerNavigate, suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState],
  );

  const swap = useCallback(
    (fullPath: string, label: string) => {
      const [pathname, fullUrl] = splitPath(fullPath);
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyReplace(pathname, label);
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path: fullUrl,
        label,
      };
      routerNavigate(fullUrl, { replace: true, state });
    },
    [journeyReplace, routerNavigate, suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState],
  );

  const fresh = useCallback(
    (fullPath: string, label: string) => {
      const [pathname, fullUrl] = splitPath(fullPath);
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyOpenFresh(pathname, label);
      positionRef.current++;
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path: fullUrl,
        label,
      };
      routerNavigate(fullUrl, { state });
    },
    [journeyOpenFresh, routerNavigate, suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState],
  );

  const openOrFocus = useCallback(
    (fullPath: string, label: string) => {
      const [pathname, fullUrl] = splitPath(fullPath);
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyOpenOrFocus(pathname, label);
      positionRef.current++;
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path: fullUrl,
        label,
      };
      routerNavigate(fullUrl, { state });
    },
    [journeyOpenOrFocus, routerNavigate, suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState],
  );

  const back = useCallback(
    (count?: number) => {
      journeyGoBack(count);
    },
    [journeyGoBack],
  );

  const closeWorkspace = useCallback(
    (workspaceId: string) => {
      journeyCloseWorkspace(workspaceId);
    },
    [journeyCloseWorkspace],
  );

  const focusWorkspace = useCallback(
    (workspaceId: string) => {
      journeyFocusWorkspace(workspaceId);
    },
    [journeyFocusWorkspace],
  );

  return useMemo(
    () => ({ push, swap, fresh, openOrFocus, back, closeWorkspace, focusWorkspace }),
    [push, swap, fresh, openOrFocus, back, closeWorkspace, focusWorkspace],
  );
}
