import { useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useJourneyNavigate } from "journey-stack";
import { SyncContext, type HistoryStateData } from "./SyncContext";

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
    (path: string, label: string, opts?: { significant?: boolean }) => {
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyNavigate(path, label, opts);
      positionRef.current++;
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path,
        label,
      };
      routerNavigate(path, { state });
    },
    [journeyNavigate, routerNavigate, suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState],
  );

  const swap = useCallback(
    (path: string, label: string) => {
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyReplace(path, label);
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path,
        label,
      };
      routerNavigate(path, { replace: true, state });
    },
    [journeyReplace, routerNavigate, suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState],
  );

  const fresh = useCallback(
    (path: string, label: string) => {
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyOpenFresh(path, label);
      positionRef.current++;
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path,
        label,
      };
      routerNavigate(path, { state });
    },
    [journeyOpenFresh, routerNavigate, suppressRouterSync, suppressLocationDispatch, positionRef, getJourneyState],
  );

  const openOrFocus = useCallback(
    (path: string, label: string) => {
      suppressRouterSync.current = true;
      suppressLocationDispatch.current = true;
      journeyOpenOrFocus(path, label);
      positionRef.current++;
      const state: HistoryStateData = {
        _journeySync: true,
        position: positionRef.current,
        workspaceId: getJourneyState().workspaceId,
        path,
        label,
      };
      routerNavigate(path, { state });
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
