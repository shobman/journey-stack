import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { JourneyProvider } from "../provider";
import {
  useActiveChapter,
  useCurrentStep,
  useJourney,
  useJourneyBrowserSync,
  useJourneyNavigate,
} from "../hooks";

let pushStateSpy: ReturnType<typeof vi.spyOn>;
let replaceStateSpy: ReturnType<typeof vi.spyOn>;
let goSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  pushStateSpy = vi.spyOn(window.history, "pushState");
  replaceStateSpy = vi.spyOn(window.history, "replaceState");
  goSpy = vi.spyOn(window.history, "go");
});

afterEach(() => {
  pushStateSpy.mockRestore();
  replaceStateSpy.mockRestore();
  goSpy.mockRestore();
});

function wrapper({ children }: { children: ReactNode }) {
  return <JourneyProvider mode="trail">{children}</JourneyProvider>;
}

function chaptersWrapper({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider mode="chapters" domains={["products", "settings"]}>
      {children}
    </JourneyProvider>
  );
}

function firePopState(state: unknown) {
  const event = new PopStateEvent("popstate", { state });
  window.dispatchEvent(event);
}

describe("useJourneyBrowserSync", () => {
  describe("initialization", () => {
    it("replaceState on mount with position 0", () => {
      renderHook(
        () => {
          useJourneyBrowserSync();
          return useCurrentStep();
        },
        { wrapper },
      );

      expect(replaceStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          _journeySync: true,
          position: 0,
          path: "/",
          label: "Home",
        }),
        "",
      );
    });
  });

  describe("app-initiated forward navigation", () => {
    it("pushState when navigate adds a step", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      pushStateSpy.mockClear();

      act(() => {
        result.current.nav.navigate("/page1", "Page 1");
      });

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          _journeySync: true,
          position: 1,
          path: "/page1",
          label: "Page 1",
        }),
        "",
      );
    });

    it("pushState when openFresh creates a chapter", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      pushStateSpy.mockClear();

      act(() => {
        result.current.nav.openFresh("/fresh", "Fresh");
      });

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ position: 1, path: "/fresh" }),
        "",
      );
    });

    it("no pushState on navigate dedup (same path)", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => {
        result.current.nav.navigate("/a", "A");
      });
      pushStateSpy.mockClear();

      act(() => {
        result.current.nav.navigate("/a", "A");
      });

      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe("app-initiated backward navigation", () => {
    it("history.go(-1) when goBack pops a step", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => {
        result.current.nav.navigate("/a", "A");
      });
      goSpy.mockClear();

      act(() => {
        result.current.nav.goBack();
      });

      expect(goSpy).toHaveBeenCalledWith(-1);
    });

    it("history.go(-N) when goToStep truncates multiple steps", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          chapter: useActiveChapter(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.navigate("/b", "B"));
      act(() => result.current.nav.navigate("/c", "C"));
      goSpy.mockClear();

      const chapterId = result.current.chapter!.id;
      act(() => {
        result.current.nav.goToStep(chapterId, 0);
      });

      expect(goSpy).toHaveBeenCalledWith(-3);
    });
  });

  describe("replace triggers replaceState", () => {
    it("replaceState when replace swaps current step", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      replaceStateSpy.mockClear();
      pushStateSpy.mockClear();

      act(() => {
        result.current.nav.replace("/b", "B");
      });

      expect(pushStateSpy).not.toHaveBeenCalled();
      expect(replaceStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ path: "/b", label: "B" }),
        "",
      );
    });
  });

  describe("browser back button (popstate)", () => {
    it("dispatches GO_BACK when browser goes back", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          step: useCurrentStep(),
          chapter: useActiveChapter(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.navigate("/b", "B"));
      expect(result.current.chapter!.steps).toHaveLength(3);

      act(() => {
        firePopState({
          _journeySync: true,
          position: 1,
          path: "/a",
          label: "A",
        });
      });

      expect(result.current.step!.path).toBe("/a");
      expect(result.current.chapter!.steps).toHaveLength(2);
    });

    it("does not pushState when processing popstate back", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      pushStateSpy.mockClear();

      act(() => {
        firePopState({
          _journeySync: true,
          position: 0,
          path: "/",
          label: "Home",
        });
      });

      expect(pushStateSpy).not.toHaveBeenCalled();
    });

    it("dispatches multiple GO_BACK for multi-step browser back", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          step: useCurrentStep(),
          chapter: useActiveChapter(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.navigate("/b", "B"));
      act(() => result.current.nav.navigate("/c", "C"));
      expect(result.current.chapter!.steps).toHaveLength(4);

      // Jump back 3 positions at once
      act(() => {
        firePopState({
          _journeySync: true,
          position: 0,
          path: "/",
          label: "Home",
        });
      });

      expect(result.current.step!.path).toBe("/");
      expect(result.current.chapter!.steps).toHaveLength(1);
    });
  });

  describe("browser forward button (popstate)", () => {
    it("dispatches NAVIGATE when browser goes forward", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          step: useCurrentStep(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      act(() => result.current.nav.navigate("/a", "A"));

      // Simulate browser back
      act(() => {
        firePopState({
          _journeySync: true,
          position: 0,
          path: "/",
          label: "Home",
        });
      });
      expect(result.current.step!.path).toBe("/");

      // Simulate browser forward
      pushStateSpy.mockClear();
      act(() => {
        firePopState({
          _journeySync: true,
          position: 1,
          path: "/a",
          label: "A",
        });
      });

      expect(result.current.step!.path).toBe("/a");
      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe("OPEN_OR_FOCUS (focus existing chapter)", () => {
    it("replaceState when focusing existing chapter", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper: chaptersWrapper },
      );

      act(() => result.current.nav.openOrFocus("/products", "Products"));
      act(() => result.current.nav.openOrFocus("/settings", "Settings"));

      replaceStateSpy.mockClear();
      pushStateSpy.mockClear();

      act(() => {
        result.current.nav.openOrFocus("/products", "Products");
      });

      expect(result.current.journey.chapters).toHaveLength(3);
      expect(pushStateSpy).not.toHaveBeenCalled();
      expect(replaceStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ path: "/products" }),
        "",
      );
    });
  });

  describe("ignores non-journey popstate events", () => {
    it("ignores popstate with null state", () => {
      const { result } = renderHook(
        () => ({
          step: useCurrentStep(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      const pathBefore = result.current.step!.path;

      act(() => {
        firePopState(null);
      });

      expect(result.current.step!.path).toBe(pathBefore);
    });

    it("ignores popstate without _journeySync sentinel", () => {
      const { result } = renderHook(
        () => ({
          step: useCurrentStep(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      const pathBefore = result.current.step!.path;

      act(() => {
        firePopState({ someOtherData: true, position: 5 });
      });

      expect(result.current.step!.path).toBe(pathBefore);
    });
  });
});
