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
let backSpy: ReturnType<typeof vi.spyOn>;
let forwardSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  pushStateSpy = vi.spyOn(window.history, "pushState");
  replaceStateSpy = vi.spyOn(window.history, "replaceState");
  goSpy = vi.spyOn(window.history, "go");
  backSpy = vi.spyOn(window.history, "back");
  forwardSpy = vi.spyOn(window.history, "forward");
});

afterEach(() => {
  pushStateSpy.mockRestore();
  replaceStateSpy.mockRestore();
  goSpy.mockRestore();
  backSpy.mockRestore();
  forwardSpy.mockRestore();
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
    it("replaceState on mount with position 0 and chapterId", () => {
      const { result } = renderHook(
        () => {
          useJourneyBrowserSync();
          return { step: useCurrentStep(), journey: useJourney() };
        },
        { wrapper },
      );

      expect(replaceStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          _journeySync: true,
          position: 0,
          chapterId: result.current.journey.activeChapterId,
          path: "/",
          label: "Home",
        }),
        "",
      );
    });
  });

  describe("app-initiated forward navigation", () => {
    it("pushState with chapterId when navigate adds a step", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
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
          chapterId: result.current.journey.activeChapterId,
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

  describe("chapter focus pushes history", () => {
    it("pushState when focusChapter switches active chapter", () => {
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

      const settingsId = result.current.journey.activeChapterId;
      const productsChapter = result.current.journey.chapters.find(
        (c) => c.domain === "products",
      )!;

      pushStateSpy.mockClear();

      act(() => {
        result.current.nav.focusChapter(productsChapter.id);
      });

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          chapterId: productsChapter.id,
          position: 3,
        }),
        "",
      );
      expect(result.current.journey.activeChapterId).toBe(productsChapter.id);
    });
  });

  describe("browser back with chapter-aware popstate", () => {
    it("GO_BACK when same chapter going back", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          step: useCurrentStep(),
          chapter: useActiveChapter(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      const chapterId = result.current.journey.activeChapterId;
      act(() => result.current.nav.navigate("/a", "A"));
      act(() => result.current.nav.navigate("/b", "B"));
      expect(result.current.chapter!.steps).toHaveLength(3);

      act(() => {
        firePopState({
          _journeySync: true,
          position: 1,
          chapterId,
          path: "/a",
          label: "A",
        });
      });

      expect(result.current.step!.path).toBe("/a");
      expect(result.current.chapter!.steps).toHaveLength(2);
    });

    it("FOCUS_CHAPTER when different chapter going back", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper: chaptersWrapper },
      );

      act(() => result.current.nav.openOrFocus("/products", "Products"));
      const productsId = result.current.journey.activeChapterId;

      act(() => result.current.nav.openOrFocus("/settings", "Settings"));
      // position=2, active=settings

      // Simulate browser back to products entry
      act(() => {
        firePopState({
          _journeySync: true,
          position: 1,
          chapterId: productsId,
          path: "/products",
          label: "Products",
        });
      });

      // Should focus products, not GO_BACK
      expect(result.current.journey.activeChapterId).toBe(productsId);
      expect(result.current.journey.chapters).toHaveLength(3); // all chapters intact
    });

    it("does not pushState when processing popstate back", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      const chapterId = result.current.journey.activeChapterId;
      act(() => result.current.nav.navigate("/a", "A"));
      pushStateSpy.mockClear();

      act(() => {
        firePopState({
          _journeySync: true,
          position: 0,
          chapterId,
          path: "/",
          label: "Home",
        });
      });

      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe("browser forward with chapter-aware popstate", () => {
    it("NAVIGATE when same chapter going forward", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          step: useCurrentStep(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper },
      );

      const chapterId = result.current.journey.activeChapterId;
      act(() => result.current.nav.navigate("/a", "A"));

      // Browser back
      act(() => {
        firePopState({
          _journeySync: true,
          position: 0,
          chapterId,
          path: "/",
          label: "Home",
        });
      });
      expect(result.current.step!.path).toBe("/");

      // Browser forward — same chapter, should NAVIGATE
      pushStateSpy.mockClear();
      act(() => {
        firePopState({
          _journeySync: true,
          position: 1,
          chapterId,
          path: "/a",
          label: "A",
        });
      });

      expect(result.current.step!.path).toBe("/a");
      expect(pushStateSpy).not.toHaveBeenCalled();
    });

    it("FOCUS_CHAPTER when different chapter going forward", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper: chaptersWrapper },
      );

      const homeId = result.current.journey.activeChapterId;
      act(() => result.current.nav.openOrFocus("/products", "Products"));
      const productsId = result.current.journey.activeChapterId;

      // Browser back to home
      act(() => {
        firePopState({
          _journeySync: true,
          position: 0,
          chapterId: homeId,
          path: "/",
          label: "Home",
        });
      });
      expect(result.current.journey.activeChapterId).toBe(homeId);

      // Browser forward to products — different chapter
      act(() => {
        firePopState({
          _journeySync: true,
          position: 1,
          chapterId: productsId,
          path: "/products",
          label: "Products",
        });
      });

      expect(result.current.journey.activeChapterId).toBe(productsId);
      expect(result.current.journey.chapters).toHaveLength(2); // both intact
    });
  });

  describe("skips closed chapters", () => {
    it("calls history.back when popstate references a closed chapter", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper: chaptersWrapper },
      );

      act(() => result.current.nav.openOrFocus("/products", "Products"));
      const productsId = result.current.journey.activeChapterId;

      act(() => result.current.nav.openOrFocus("/settings", "Settings"));
      // Close products chapter (triggers history.go(-1), sets suppressPop)
      act(() => result.current.nav.closeChapter(productsId));
      // jsdom doesn't fire popstate from history.go(), so clear the flag
      act(() => firePopState(null));

      backSpy.mockClear();

      // Simulate popstate landing on the closed products entry
      act(() => {
        firePopState({
          _journeySync: true,
          position: 0,
          chapterId: productsId,
          path: "/products",
          label: "Products",
        });
      });

      // Should skip — call history.back() to keep going
      expect(backSpy).toHaveBeenCalled();
    });

    it("calls history.forward when forward popstate references a closed chapter", () => {
      const { result } = renderHook(
        () => ({
          nav: useJourneyNavigate(),
          journey: useJourney(),
          _sync: useJourneyBrowserSync(),
        }),
        { wrapper: chaptersWrapper },
      );

      act(() => result.current.nav.openOrFocus("/products", "Products"));
      const productsId = result.current.journey.activeChapterId;

      act(() => result.current.nav.openOrFocus("/settings", "Settings"));
      // Close products (triggers history.go(-1), sets suppressPop)
      act(() => result.current.nav.closeChapter(productsId));
      // Clear suppressPop (jsdom doesn't fire popstate from go())
      act(() => firePopState(null));

      forwardSpy.mockClear();

      // Simulate forward popstate landing on closed products entry
      act(() => {
        firePopState({
          _journeySync: true,
          position: 2,
          chapterId: productsId,
          path: "/products",
          label: "Products",
        });
      });

      expect(forwardSpy).toHaveBeenCalled();
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
