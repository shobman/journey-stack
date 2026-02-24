import { describe, expect, it } from "vitest";
import { classifyGoBack } from "../provider";
import type { JourneyWorkspace } from "../types";

function makeState(
  chapters: Array<{ id: string; stepsCount: number }>,
  activeId: string,
): JourneyWorkspace {
  return {
    chapters: chapters.map((c) => ({
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
    focusStack: chapters.map((c) => c.id),
    activeChapterId: activeId,
  };
}

describe("classifyGoBack", () => {
  it("returns 'back' when active chapter has multiple steps", () => {
    const state = makeState([{ id: "ch1", stepsCount: 3 }], "ch1");
    expect(classifyGoBack(state)).toEqual({ type: "back", chapterId: "ch1" });
  });

  it("returns 'close' when at chapter root with other chapters open", () => {
    const state = makeState(
      [
        { id: "ch1", stepsCount: 2 },
        { id: "ch2", stepsCount: 1 },
      ],
      "ch2",
    );
    expect(classifyGoBack(state)).toEqual({ type: "close", chapterId: "ch2" });
  });

  it("returns 'closeAll' when at root of the only chapter", () => {
    const state = makeState([{ id: "ch1", stepsCount: 1 }], "ch1");
    expect(classifyGoBack(state)).toEqual({
      type: "closeAll",
      chapterId: "ch1",
    });
  });

  it("returns null when active chapter not found", () => {
    const state = makeState([{ id: "ch1", stepsCount: 1 }], "nonexistent");
    expect(classifyGoBack(state)).toBeNull();
  });
});
