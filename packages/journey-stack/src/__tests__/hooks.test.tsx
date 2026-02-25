import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { JourneyProvider } from "../provider";
import {
  useActiveWorkspace,
  useCurrentStep,
  useJourney,
  useJourneyNavigate,
} from "../hooks";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider mode="workspaces" domains={["products", "settings"]}>
      {children}
    </JourneyProvider>
  );
}

function trailWrapper({ children }: { children: ReactNode }) {
  return <JourneyProvider mode="trail">{children}</JourneyProvider>;
}

describe("useJourney", () => {
  it("returns journey state", () => {
    const { result } = renderHook(() => useJourney(), { wrapper });
    expect(result.current.workspaces).toHaveLength(1);
    expect(result.current.activeWorkspaceId).toBeTruthy();
  });

  it("throws outside provider", () => {
    expect(() => {
      renderHook(() => useJourney());
    }).toThrow("useJourney* hooks must be used within a <JourneyProvider>");
  });
});

describe("useActiveWorkspace", () => {
  it("returns active workspace", () => {
    const { result } = renderHook(() => useActiveWorkspace(), { wrapper });
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
        workspace: useActiveWorkspace(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/page1", "Page 1");
    });

    expect(result.current.workspace!.steps).toHaveLength(2);
    expect(result.current.workspace!.steps[1].path).toBe("/page1");
  });

  it("replace swaps current step", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        step: useCurrentStep(),
        workspace: useActiveWorkspace(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    act(() => {
      result.current.nav.replace("/b", "B");
    });

    expect(result.current.workspace!.steps).toHaveLength(2); // Home + replaced
    expect(result.current.step!.path).toBe("/b");
  });

  it("openFresh creates a new workspace", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        workspace: useActiveWorkspace(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.openFresh("/fresh", "Fresh");
    });

    expect(result.current.journey.workspaces).toHaveLength(2);
    expect(result.current.workspace!.title).toBe("Fresh");
  });

  it("goBack pops step", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        step: useCurrentStep(),
        workspace: useActiveWorkspace(),
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

  it("goBack(count) pops multiple steps", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        step: useCurrentStep(),
        workspace: useActiveWorkspace(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => result.current.nav.navigate("/a", "A"));
    act(() => result.current.nav.navigate("/b", "B"));
    act(() => result.current.nav.navigate("/c", "C"));
    act(() => result.current.nav.goBack(2));

    expect(result.current.step!.path).toBe("/a");
    expect(result.current.workspace!.steps).toHaveLength(2);
  });

  it("workspaces mode creates workspace on domain cross", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        workspace: useActiveWorkspace(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.nav.navigate("/products", "Products");
    });
    act(() => {
      result.current.nav.navigate("/settings", "Settings");
    });

    expect(result.current.journey.workspaces).toHaveLength(3);
    expect(result.current.workspace!.title).toBe("Settings");
  });

  it("deduplicates navigation to same path", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        workspace: useActiveWorkspace(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    const len = result.current.workspace!.steps.length;
    act(() => {
      result.current.nav.navigate("/a", "A");
    });
    expect(result.current.workspace!.steps.length).toBe(len);
  });

  it("openOrFocus creates workspace then focuses existing on repeat", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        workspace: useActiveWorkspace(),
      }),
      { wrapper },
    );

    // First call creates a workspace
    act(() => {
      result.current.nav.openOrFocus("/products", "Products");
    });
    expect(result.current.journey.workspaces).toHaveLength(2);
    const productsId = result.current.journey.activeWorkspaceId;

    // Navigate away
    act(() => {
      result.current.nav.openOrFocus("/settings", "Settings");
    });
    expect(result.current.journey.workspaces).toHaveLength(3);
    expect(result.current.journey.activeWorkspaceId).not.toBe(productsId);

    // Second call focuses existing — no new workspace
    act(() => {
      result.current.nav.openOrFocus("/products", "Products");
    });
    expect(result.current.journey.workspaces).toHaveLength(3);
    expect(result.current.journey.activeWorkspaceId).toBe(productsId);
  });

  it("closeWorkspace removes a workspace", () => {
    const { result } = renderHook(
      () => ({
        nav: useJourneyNavigate(),
        journey: useJourney(),
        workspace: useActiveWorkspace(),
      }),
      { wrapper: trailWrapper },
    );

    act(() => {
      result.current.nav.openFresh("/x", "X");
    });
    expect(result.current.journey.workspaces).toHaveLength(2);
    const xId = result.current.journey.activeWorkspaceId;

    act(() => {
      result.current.nav.closeWorkspace(xId);
    });
    expect(result.current.journey.workspaces).toHaveLength(1);
    expect(result.current.workspace!.title).toBe("Home");
  });

});
