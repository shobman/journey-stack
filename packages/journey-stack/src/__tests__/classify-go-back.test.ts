import { describe, expect, it } from "vitest";
import { classifyGoBack } from "../provider";
import type { JourneyState } from "../types";

function makeState(
  workspaces: Array<{ id: string; stepsCount: number }>,
  activeId: string,
): JourneyState {
  return {
    workspaces: workspaces.map((c) => ({
      id: c.id,
      title: c.id,
      domain: "",
      steps: Array.from({ length: c.stepsCount }, (_, i) => ({
        id: crypto.randomUUID(),
        path: `/${c.id}/${i}`,
        label: `${c.id}-${i}`,
        timestamp: Date.now(),
      })),
    })),
    focusStack: workspaces.map((c) => c.id),
    activeWorkspaceId: activeId,
  };
}

describe("classifyGoBack", () => {
  it("returns 'back' when active workspace has multiple steps", () => {
    const state = makeState([{ id: "ws1", stepsCount: 3 }], "ws1");
    expect(classifyGoBack(state)).toEqual({ type: "back", workspaceId: "ws1" });
  });

  it("returns 'close' when at workspace root with other workspaces open", () => {
    const state = makeState(
      [
        { id: "ws1", stepsCount: 2 },
        { id: "ws2", stepsCount: 1 },
      ],
      "ws2",
    );
    expect(classifyGoBack(state)).toEqual({ type: "close", workspaceId: "ws2" });
  });

  it("returns 'closeAll' when at root of the only workspace", () => {
    const state = makeState([{ id: "ws1", stepsCount: 1 }], "ws1");
    expect(classifyGoBack(state)).toEqual({
      type: "closeAll",
      workspaceId: "ws1",
    });
  });

  it("returns null when active workspace not found", () => {
    const state = makeState([{ id: "ws1", stepsCount: 1 }], "nonexistent");
    expect(classifyGoBack(state)).toBeNull();
  });

  describe("with count", () => {
    it("returns 'back' when count < steps", () => {
      const state = makeState([{ id: "ws1", stepsCount: 5 }], "ws1");
      expect(classifyGoBack(state, 3)).toEqual({ type: "back", workspaceId: "ws1" });
    });

    it("returns 'close' when count >= steps with other workspaces", () => {
      const state = makeState(
        [
          { id: "ws1", stepsCount: 2 },
          { id: "ws2", stepsCount: 3 },
        ],
        "ws2",
      );
      expect(classifyGoBack(state, 3)).toEqual({ type: "close", workspaceId: "ws2" });
    });

    it("returns 'closeAll' when count >= steps on last workspace", () => {
      const state = makeState([{ id: "ws1", stepsCount: 2 }], "ws1");
      expect(classifyGoBack(state, 2)).toEqual({
        type: "closeAll",
        workspaceId: "ws1",
      });
    });
  });
});
