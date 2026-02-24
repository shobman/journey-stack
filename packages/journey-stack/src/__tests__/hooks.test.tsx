import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { JourneyProvider } from "../provider";
import {
  useActiveChapter,
  useCurrentStep,
  useJourney,
  useJourneyNavigate,
} from "../hooks";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider mode="chapters" domains={["products", "settings"]}>
      {children}
    </JourneyProvider>
  );
}

function trailWrapper({ children }: { children: ReactNode }) {
  return <JourneyProvider mode="trail">{children}</JourneyProvider>;
}

describe("useJourney", () => {
  it("returns workspace state", () => {
    const { result } = renderHook(() => useJourney(), { wrapper });
    expect(result.current.chapters).toHaveLength(1);
    expect(result.current.activeChapterId).toBeTruthy();
  });

  it("throws outside provider", () => {
    expect(() => {
      renderHook(() => useJourney());
    }).toThrow("useJourney* hooks must be used within a <JourneyProvider>");
  });
});

describe("useActiveChapter", () => {
  it("returns active chapter", () => {
    const { result } = renderHook(() => useActiveChapter(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current!.title).toBe("Home");
  });
});

describe("useCurrentStep", () => {
  it("returns latest step", () => {
    const { result } = renderHook(() => useCurrentStep(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current!.path).toBe("/");
  });
});

describe("useJourneyNavigate", () => {
  it("navigate pushes a step", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        chapter: useActiveChapter(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/page1", "Page 1");
    });

    expect(result.current.chapter!.steps).toHaveLength(2);
    expect(result.current.chapter!.steps[1].path).toBe("/page1");
  });

  it("replace swaps current step", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        step: useCurrentStep(),
        chapter: useActiveChapter(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    act(() => {
      result.current.nav.replace("/b", "B");
    });

    expect(result.current.chapter!.steps).toHaveLength(2); // Home + replaced
    expect(result.current.step!.path).toBe("/b");
  });

  it("openFresh creates a new chapter", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        chapter: useActiveChapter(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.openFresh("/fresh", "Fresh");
    });

    expect(result.current.journey.chapters).toHaveLength(2);
    expect(result.current.chapter!.title).toBe("Fresh");
  });

  it("goBack pops step", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        step: useCurrentStep(),
        chapter: useActiveChapter(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    act(() => {
      result.current.nav.navigate("/b", "B");
    });
    act(() => {
      result.current.nav.goBack();
    });

    expect(result.current.step!.path).toBe("/a");
  });

  it("chapters mode creates chapter on domain cross", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        chapter: useActiveChapter(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.nav.navigate("/products", "Products");
    });
    act(() => {
      result.current.nav.navigate("/settings", "Settings");
    });

    expect(result.current.journey.chapters).toHaveLength(3);
    expect(result.current.chapter!.title).toBe("Settings");
  });

  it("deduplicates navigation to same path", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        chapter: useActiveChapter(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    const len = result.current.chapter!.steps.length;
    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    expect(result.current.chapter!.steps.length).toBe(len);
  });

  it("openOrFocus creates chapter then focuses existing on repeat", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        chapter: useActiveChapter(),
      }),
      { wrapper },
    );

    // First call creates a chapter
    act(() => {
      result.current.nav.openOrFocus("/products", "Products");
    });
    expect(result.current.journey.chapters).toHaveLength(2);
    const productsId = result.current.journey.activeChapterId;

    // Navigate away
    act(() => {
      result.current.nav.openOrFocus("/settings", "Settings");
    });
    expect(result.current.journey.chapters).toHaveLength(3);
    expect(result.current.journey.activeChapterId).not.toBe(productsId);

    // Second call focuses existing — no new chapter
    act(() => {
      result.current.nav.openOrFocus("/products", "Products");
    });
    expect(result.current.journey.chapters).toHaveLength(3);
    expect(result.current.journey.activeChapterId).toBe(productsId);
  });

  it("closeChapter removes a chapter", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        chapter: useActiveChapter(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.openFresh("/x", "X");
    });
    expect(result.current.journey.chapters).toHaveLength(2);
    const xId = result.current.journey.activeChapterId;

    act(() => {
      result.current.nav.closeChapter(xId);
    });
    expect(result.current.journey.chapters).toHaveLength(1);
    expect(result.current.chapter!.title).toBe("Home");
  });

  it("goToStep truncates chapter stack", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        chapter: useActiveChapter(),
        step: useCurrentStep(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    act(() => {
      result.current.nav.navigate("/b", "B");
    });
    act(() => {
      result.current.nav.navigate("/c", "C");
    });
    expect(result.current.chapter!.steps).toHaveLength(4);

    const chapterId = result.current.chapter!.id;
    act(() => {
      result.current.nav.goToStep(chapterId, 1);
    });
    expect(result.current.chapter!.steps).toHaveLength(2);
    expect(result.current.step!.path).toBe("/a");
  });
});
