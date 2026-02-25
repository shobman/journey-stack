import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState, type ReactNode } from "react";
import { JourneyProvider } from "../provider";
import {
  useActiveWorkspace,
  useJourney,
  useJourneyBlock,
  useJourneyNavigate,
} from "../hooks";
import type { BlockerAction } from "../types";

function wrapper({ children }: { children: ReactNode }) {
  return <JourneyProvider mode="trail">{children}</JourneyProvider>;
}

function workspacesWrapper({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider mode="workspaces" domains={["products", "settings"]}>
      {children}
    </JourneyProvider>
  );
}

describe("useJourneyBlock", () => {
  describe("back (popping a step)", () => {
    it("blocks GO_BACK when blocker returns false", () => {
      const blocker = vi.fn(() => false);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          workspace: useActiveWorkspace(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      expect(result.current.workspace!.steps).toHaveLength(2);

      act(() => result.current.nav.goBack());
      expect(result.current.workspace!.steps).toHaveLength(2); // blocked
    });

    it("allows GO_BACK when blocker returns true", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          workspace: useActiveWorkspace(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.goBack());
      expect(result.current.workspace!.steps).toHaveLength(1);
    });

    it("receives action with type 'back' and correct workspaceId", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      const workspaceId = result.current.journey.activeWorkspaceId;

      act(() => result.current.nav.goBack());
      expect(blocker).toHaveBeenCalledWith({
        type: "back",
        workspaceId,
      } satisfies BlockerAction);
    });

    it("fires once (not per-step) when goBack(count) is called", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          workspace: useActiveWorkspace(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.navigate("/b", "B"));
      act(() => result.current.nav.navigate("/c", "C"));
      blocker.mockClear();

      act(() => result.current.nav.goBack(2));

      expect(blocker).toHaveBeenCalledTimes(1);
      expect(result.current.workspace!.steps).toHaveLength(2);
    });

    it("receives 'close' when count exceeds step count", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.openFresh("/other", "Other"));
      act(() => result.current.nav.navigate("/deep", "Deep"));
      blocker.mockClear();

      const workspaceId = result.current.journey.activeWorkspaceId;
      act(() => result.current.nav.goBack(5));

      expect(blocker).toHaveBeenCalledWith({
        type: "close",
        workspaceId,
      } satisfies BlockerAction);
      expect(result.current.journey.workspaces).toHaveLength(1);
    });
  });

  describe("close (closing a workspace at root)", () => {
    it("blocks workspace close when blocker returns false", () => {
      const blocker = vi.fn(() => false);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.openFresh("/other", "Other"));
      expect(result.current.journey.workspaces).toHaveLength(2);

      // At root of "Other" workspace, goBack should close it — but blocker blocks
      act(() => result.current.nav.goBack());
      expect(result.current.journey.workspaces).toHaveLength(2); // blocked
    });

    it("allows workspace close when blocker returns true", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.openFresh("/other", "Other"));
      act(() => result.current.nav.goBack());
      expect(result.current.journey.workspaces).toHaveLength(1);
    });

    it("receives action with type 'close'", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.openFresh("/other", "Other"));
      const workspaceId = result.current.journey.activeWorkspaceId;

      act(() => result.current.nav.goBack());
      expect(blocker).toHaveBeenCalledWith({
        type: "close",
        workspaceId,
      });
    });
  });

  describe("closeAll (closing the last workspace)", () => {
    it("blocks closeAll when blocker returns false", () => {
      const blocker = vi.fn(() => false);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      // At root of the only workspace
      expect(result.current.journey.workspaces).toHaveLength(1);
      const originalId = result.current.journey.activeWorkspaceId;

      act(() => result.current.nav.goBack());
      // blocked — still same workspace
      expect(result.current.journey.activeWorkspaceId).toBe(originalId);
    });

    it("allows closeAll and resets to home", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      const originalId = result.current.journey.activeWorkspaceId;
      act(() => result.current.nav.goBack());

      // New home workspace created (different id)
      expect(result.current.journey.workspaces).toHaveLength(1);
      expect(result.current.journey.activeWorkspaceId).not.toBe(originalId);
    });

    it("receives action with type 'closeAll'", () => {
      const blocker = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.goBack());
      expect(blocker).toHaveBeenCalledWith(
        expect.objectContaining({ type: "closeAll" }),
      );
    });
  });

  describe("non-destructive actions are not guarded", () => {
    it("NAVIGATE passes through without consulting blockers", () => {
      const blocker = vi.fn(() => false);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          workspace: useActiveWorkspace(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      expect(result.current.workspace!.steps).toHaveLength(2);
      expect(blocker).not.toHaveBeenCalled();
    });

    it("REPLACE passes through without consulting blockers", () => {
      const blocker = vi.fn(() => false);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          workspace: useActiveWorkspace(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      blocker.mockClear();

      act(() => result.current.nav.replace("/b", "B"));
      expect(result.current.workspace!.steps[1].path).toBe("/b");
      expect(blocker).not.toHaveBeenCalled();
    });

    it("OPEN_FRESH passes through without consulting blockers", () => {
      const blocker = vi.fn(() => false);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _block: useJourneyBlock(blocker),
        }),
        { wrapper },
      );

      act(() => result.current.nav.openFresh("/fresh", "Fresh"));
      expect(result.current.journey.workspaces).toHaveLength(2);
      expect(blocker).not.toHaveBeenCalled();
    });
  });

  describe("multiple blockers", () => {
    it("blocks if any blocker returns false", () => {
      const blockerA = vi.fn(() => true);
      const blockerB = vi.fn(() => false);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          workspace: useActiveWorkspace(),
          _blockA: useJourneyBlock(blockerA),
          _blockB: useJourneyBlock(blockerB),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.goBack());

      expect(result.current.workspace!.steps).toHaveLength(2); // blocked
    });

    it("allows only when all blockers return true", () => {
      const blockerA = vi.fn(() => true);
      const blockerB = vi.fn(() => true);

      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          workspace: useActiveWorkspace(),
          _blockA: useJourneyBlock(blockerA),
          _blockB: useJourneyBlock(blockerB),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.goBack());

      expect(result.current.workspace!.steps).toHaveLength(1); // allowed
      expect(blockerA).toHaveBeenCalled();
      expect(blockerB).toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("unregisters blocker on component unmount", () => {
      function BlockerChild({ blocker }: { blocker: () => boolean }) {
        useJourneyBlock(blocker);
        return null;
      }

      function TestHarness() {
        const [showBlocker, setShowBlocker] = useState(true);
        const nav = useJourneyNavigate();
        const workspace = useActiveWorkspace();

        return (
          <>
            {showBlocker && <BlockerChild blocker={() => false} />}
            <button
              data-testid="navigate"
              onClick={() => nav.navigate("/a", "A")}
            />
            <button data-testid="goback" onClick={() => nav.goBack()} />
            <button
              data-testid="unmount-blocker"
              onClick={() => setShowBlocker(false)}
            />
            <span data-testid="steps">{workspace?.steps.length ?? 0}</span>
          </>
        );
      }

      render(
        <JourneyProvider mode="trail">
          <TestHarness />
        </JourneyProvider>,
      );

      // Navigate to create a step
      act(() => screen.getByTestId("navigate").click());
      expect(screen.getByTestId("steps").textContent).toBe("2");

      // goBack should be blocked
      act(() => screen.getByTestId("goback").click());
      expect(screen.getByTestId("steps").textContent).toBe("2");

      // Unmount the blocker component
      act(() => screen.getByTestId("unmount-blocker").click());

      // Now goBack should succeed
      act(() => screen.getByTestId("goback").click());
      expect(screen.getByTestId("steps").textContent).toBe("1");
    });

    it("uses latest blocker closure after re-render", () => {
      const calls: BlockerAction[] = [];

      function TestHarness() {
        const [shouldBlock, setShouldBlock] = useState(true);
        const nav = useJourneyNavigate();
        const workspace = useActiveWorkspace();

        useJourneyBlock((action) => {
          calls.push(action);
          return !shouldBlock;
        });

        return (
          <>
            <button
              data-testid="navigate"
              onClick={() => nav.navigate("/a", "A")}
            />
            <button data-testid="goback" onClick={() => nav.goBack()} />
            <button
              data-testid="allow"
              onClick={() => setShouldBlock(false)}
            />
            <span data-testid="steps">{workspace?.steps.length ?? 0}</span>
          </>
        );
      }

      render(
        <JourneyProvider mode="trail">
          <TestHarness />
        </JourneyProvider>,
      );

      act(() => screen.getByTestId("navigate").click());

      // Blocked initially
      act(() => screen.getByTestId("goback").click());
      expect(screen.getByTestId("steps").textContent).toBe("2");

      // Toggle to allow
      act(() => screen.getByTestId("allow").click());

      // Now should pass
      act(() => screen.getByTestId("goback").click());
      expect(screen.getByTestId("steps").textContent).toBe("1");
    });
  });
});
