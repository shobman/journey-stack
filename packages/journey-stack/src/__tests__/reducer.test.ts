import { beforeEach, describe, expect, it } from "vitest";
import {
  createInitialState,
  journeyReducer,
  resetChapterCounter,
} from "../reducer";
import type { JourneyConfig, JourneyWorkspace } from "../types";

function getActive(state: JourneyWorkspace) {
  return state.chapters.find((c) => c.id === state.activeChapterId)!;
}

function currentStep(state: JourneyWorkspace) {
  const ch = getActive(state);
  return ch.steps[ch.steps.length - 1];
}

describe("reducer", () => {
  beforeEach(() => {
    resetChapterCounter();
  });

  describe("initial state", () => {
    it("creates a single home chapter", () => {
      const config: JourneyConfig = { mode: "trail" };
      const state = createInitialState(config);
      expect(state.chapters).toHaveLength(1);
      expect(state.chapters[0].title).toBe("Home");
      expect(state.chapters[0].steps[0].path).toBe("/");
    });

    it("uses custom home path and label", () => {
      const config: JourneyConfig = {
        mode: "trail",
        homePath: "/dashboard",
        homeLabel: "Dashboard",
      };
      const state = createInitialState(config);
      expect(state.chapters[0].steps[0].path).toBe("/dashboard");
      expect(state.chapters[0].title).toBe("Dashboard");
    });

});

  describe("NAVIGATE — trail mode", () => {
    const config: JourneyConfig = { mode: "trail" };

    it("pushes steps onto the active chapter", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/b", label: "B" }, config);

      const ch = getActive(state);
      expect(ch.steps).toHaveLength(3); // Home + A + B
      expect(ch.steps.map((s) => s.path)).toEqual(["/", "/a", "/b"]);
    });

    it("never creates a new chapter in trail mode", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/products", label: "Products" },
        config,
      );
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/settings", label: "Settings" },
        config,
      );

      expect(state.chapters).toHaveLength(1);
    });

    it("deduplicates navigation to current path", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);
      const before = getActive(state).steps.length;
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);
      expect(getActive(state).steps.length).toBe(before);
    });
  });

  describe("NAVIGATE — chapters mode", () => {
    const config: JourneyConfig = {
      mode: "chapters",
      domains: ["products", "settings", "users"],
    };

    it("extends chapter within same domain", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/products", label: "Products" },
        config,
      );
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/products/123", label: "Product 123" },
        config,
      );

      // Home chapter + products chapter (Home→Products crossed domains)
      // Actually: Home is at "/" with domain "", products has domain "products"
      // "" is not in domains list, so navigating FROM home extends. Let me check...
      // Actually the significance check: currentDomain="" targetDomain="products"
      // target "products" IS in domains list, and "" !== "products", so it IS significant
      expect(state.chapters.length).toBe(2);
      const active = getActive(state);
      expect(active.steps).toHaveLength(2); // products + products/123
    });

    it("creates new chapter when crossing domains", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/products", label: "Products" },
        config,
      );
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/settings", label: "Settings" },
        config,
      );

      expect(state.chapters.length).toBe(3); // Home, Products, Settings
    });

    it("respects explicit significant=false override", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/products", label: "Products", significant: false },
        config,
      );

      expect(state.chapters).toHaveLength(1);
      expect(getActive(state).steps).toHaveLength(2);
    });

    it("respects explicit significant=true override", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "NAVIGATE", path: "/", label: "Still Home", significant: true },
        config,
      );

      // Even though path didn't change domain, forced a new chapter
      // Wait — path IS "/" and current is "/" so it should dedup. Let me use a different path.
      // Actually the dedup check is path equality, and current is "/" target is "/" — that's a dedup.
      // Let me use a subpath.
      state = createInitialState(config);
      state = journeyReducer(
        state,
        {
          type: "NAVIGATE",
          path: "/products/1",
          label: "Product 1",
        },
        config,
      );
      // Now we're at /products/1 in the products chapter
      state = journeyReducer(
        state,
        {
          type: "NAVIGATE",
          path: "/products/2",
          label: "Product 2",
          significant: true,
        },
        config,
      );

      // Despite same domain, explicit significant=true forces new chapter
      expect(state.chapters.length).toBe(3); // Home, Products (with /1), Products (with /2)
    });
  });

  describe("REPLACE", () => {
    const config: JourneyConfig = { mode: "trail" };

    it("swaps current step in place", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);
      state = journeyReducer(state, { type: "REPLACE", path: "/b", label: "B" }, config);

      const ch = getActive(state);
      expect(ch.steps).toHaveLength(2); // Home + replaced step
      expect(currentStep(state).path).toBe("/b");
    });
  });

  describe("OPEN_FRESH", () => {
    const config: JourneyConfig = { mode: "trail" };

    it("always creates a new chapter", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "OPEN_FRESH", path: "/x", label: "X" },
        config,
      );

      expect(state.chapters).toHaveLength(2);
      expect(getActive(state).title).toBe("X");
      expect(getActive(state).steps).toHaveLength(1);
    });

    it("creates new chapter even in trail mode", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "OPEN_FRESH", path: "/special", label: "Special" },
        config,
      );

      expect(state.chapters).toHaveLength(2);
    });
  });

  describe("step id", () => {
    const config: JourneyConfig = { mode: "trail" };

    it("every step has an id", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);

      for (const step of getActive(state).steps) {
        expect(step.id).toEqual(expect.any(String));
        expect(step.id.length).toBeGreaterThan(0);
      }
    });

    it("same path in same chapter gets different ids", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);
      // navigate away then back to /a to bypass dedup
      state = journeyReducer(state, { type: "NAVIGATE", path: "/b", label: "B" }, config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);

      const steps = getActive(state).steps;
      const aSteps = steps.filter((s) => s.path === "/a");
      expect(aSteps).toHaveLength(2);
      expect(aSteps[0].id).not.toBe(aSteps[1].id);
    });

    it("same path in different chapters gets different ids", () => {
      const chaptersConfig: JourneyConfig = {
        mode: "chapters",
        domains: ["a", "b"],
      };
      let state = createInitialState(chaptersConfig);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a/page", label: "Page" }, chaptersConfig);
      const firstId = getActive(state).steps[0].id;

      state = journeyReducer(state, { type: "OPEN_FRESH", path: "/a/page", label: "Page" }, chaptersConfig);
      const secondId = getActive(state).steps[0].id;

      expect(firstId).not.toBe(secondId);
    });

    it("REPLACE generates a new id", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);
      const originalId = currentStep(state).id;

      state = journeyReducer(state, { type: "REPLACE", path: "/b", label: "B" }, config);
      expect(currentStep(state).id).not.toBe(originalId);
    });

    it("OPEN_FRESH initial step has an id", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "OPEN_FRESH", path: "/x", label: "X" }, config);

      expect(getActive(state).steps[0].id).toEqual(expect.any(String));
    });
  });

  describe("GO_BACK", () => {
    const config: JourneyConfig = { mode: "trail" };

    it("pops the top step", () => {
      let state = createInitialState(config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/a", label: "A" }, config);
      state = journeyReducer(state, { type: "NAVIGATE", path: "/b", label: "B" }, config);
      state = journeyReducer(state, { type: "GO_BACK" }, config);

      expect(currentStep(state).path).toBe("/a");
      expect(getActive(state).steps).toHaveLength(2);
    });

    it("closes chapter at root and activates previous", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "OPEN_FRESH", path: "/x", label: "X" },
        config,
      );
      expect(state.chapters).toHaveLength(2);

      state = journeyReducer(state, { type: "GO_BACK" }, config);

      expect(state.chapters).toHaveLength(1);
      expect(getActive(state).title).toBe("Home");
    });

    it("creates default chapter when closing the last chapter", () => {
      const state = createInitialState(config);
      const result = journeyReducer(state, { type: "GO_BACK" }, config);

      expect(result.chapters).toHaveLength(1);
      expect(getActive(result).steps[0].path).toBe("/");
    });
  });

  describe("OPEN_OR_FOCUS", () => {
    const config: JourneyConfig = {
      mode: "chapters",
      domains: ["devices", "services", "companies"],
    };

    it("creates chapter when none exists for domain", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices", label: "Devices" },
        config,
      );

      expect(state.chapters).toHaveLength(2);
      expect(getActive(state).title).toBe("Devices");
      expect(getActive(state).domain).toBe("devices");
    });

    it("switches to existing chapter when one exists", () => {
      let state = createInitialState(config);
      // Create a devices chapter
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices", label: "Devices" },
        config,
      );
      const devicesChapterId = state.activeChapterId;

      // Create a services chapter
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/services", label: "Services" },
        config,
      );
      expect(state.activeChapterId).not.toBe(devicesChapterId);

      // Now focus back on devices — should NOT create a new chapter
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices", label: "Devices" },
        config,
      );

      expect(state.chapters).toHaveLength(3); // Home + Devices + Services
      expect(state.activeChapterId).toBe(devicesChapterId);
    });

    it("does not create duplicate chapters for same domain", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices", label: "Devices" },
        config,
      );
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices", label: "Devices" },
        config,
      );
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices/1", label: "Device 1" },
        config,
      );

      // Should still only have 2 chapters: Home + Devices
      const devicesChapters = state.chapters.filter((c) => c.domain === "devices");
      expect(devicesChapters).toHaveLength(1);
    });

    it("is a no-op when target chapter is already active", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices", label: "Devices" },
        config,
      );
      const before = state;

      state = journeyReducer(
        state,
        { type: "OPEN_OR_FOCUS", path: "/devices", label: "Devices" },
        config,
      );

      // Should return same reference (no-op)
      expect(state).toBe(before);
    });
  });

  describe("CLOSE_CHAPTER", () => {
    const config: JourneyConfig = { mode: "trail" };

    it("removes the chapter and activates previous", () => {
      let state = createInitialState(config);
      state = journeyReducer(
        state,
        { type: "OPEN_FRESH", path: "/x", label: "X" },
        config,
      );
      const chapterToClose = state.activeChapterId;
      expect(state.chapters).toHaveLength(2);

      state = journeyReducer(
        state,
        { type: "CLOSE_CHAPTER", chapterId: chapterToClose },
        config,
      );

      expect(state.chapters).toHaveLength(1);
      expect(getActive(state).title).toBe("Home");
    });

    it("creates default chapter when closing the last chapter", () => {
      let state = createInitialState(config);
      const onlyChapter = state.chapters[0].id;

      state = journeyReducer(
        state,
        { type: "CLOSE_CHAPTER", chapterId: onlyChapter },
        config,
      );

      expect(state.chapters).toHaveLength(1);
      expect(getActive(state).steps[0].path).toBe("/");
    });

    it("can close a non-active chapter", () => {
      let state = createInitialState(config);
      const homeId = state.chapters[0].id;

      state = journeyReducer(
        state,
        { type: "OPEN_FRESH", path: "/x", label: "X" },
        config,
      );
      const activeId = state.activeChapterId;
      expect(state.chapters).toHaveLength(2);

      // Close the home chapter (not active)
      state = journeyReducer(
        state,
        { type: "CLOSE_CHAPTER", chapterId: homeId },
        config,
      );

      expect(state.chapters).toHaveLength(1);
      expect(state.activeChapterId).toBe(activeId); // active didn't change
    });
  });

});
