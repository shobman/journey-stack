import type {
  JourneyAction,
  JourneyChapter,
  JourneyConfig,
  JourneyStep,
  JourneyWorkspace,
} from "./types";
import { extractDomain, resolveSignificance } from "./significance";

let chapterCounter = 0;

export function generateChapterId(): string {
  return `ch_${++chapterCounter}_${Date.now()}`;
}

/** Reset counter — useful for tests. */
export function resetChapterCounter(): void {
  chapterCounter = 0;
}

function createStep(path: string, label: string): JourneyStep {
  return { id: crypto.randomUUID(), path, label, timestamp: Date.now() };
}

function createChapter(path: string, label: string): JourneyChapter {
  const step = createStep(path, label);
  return {
    id: generateChapterId(),
    title: label,
    domain: extractDomain(path),
    steps: [step],
  };
}

function createDefaultChapter(config: JourneyConfig): JourneyChapter {
  const path = config.homePath ?? "/";
  const label = config.homeLabel ?? "Home";
  return createChapter(path, label);
}

function getActiveChapter(state: JourneyWorkspace): JourneyChapter | undefined {
  return state.chapters.find((c) => c.id === state.activeChapterId);
}

function getCurrentStep(chapter: JourneyChapter): JourneyStep | undefined {
  return chapter.steps[chapter.steps.length - 1];
}

function replaceChapter(
  state: JourneyWorkspace,
  chapterId: string,
  updater: (chapter: JourneyChapter) => JourneyChapter,
): JourneyWorkspace {
  return {
    ...state,
    chapters: state.chapters.map((c) =>
      c.id === chapterId ? updater(c) : c,
    ),
  };
}

export function createInitialState(config: JourneyConfig): JourneyWorkspace {
  const chapter = createDefaultChapter(config);
  return {
    chapters: [chapter],
    activeChapterId: chapter.id,
  };
}

export function journeyReducer(
  state: JourneyWorkspace,
  action: JourneyAction,
  config: JourneyConfig,
): JourneyWorkspace {
  switch (action.type) {
    case "NAVIGATE": {
      const active = getActiveChapter(state);
      if (!active) return state;

      const currentStep = getCurrentStep(active);

      // Deduplicate: navigating to current path is a no-op
      if (currentStep && currentStep.path === action.path) {
        return state;
      }

      const currentPath = currentStep?.path ?? "/";
      const isSignificant = resolveSignificance(
        action.significant,
        config.mode,
        currentPath,
        action.path,
        config.domains,
      );

      if (isSignificant) {
        // Start a new chapter
        const newChapter = createChapter(action.path, action.label);

        return {
          ...state,
          chapters: [...state.chapters, newChapter],
          activeChapterId: newChapter.id,
        };
      }

      // Extend current chapter
      return replaceChapter(state, active.id, (chapter) => ({
        ...chapter,
        steps: [...chapter.steps, createStep(action.path, action.label)],
      }));
    }

    case "REPLACE": {
      const active = getActiveChapter(state);
      if (!active || active.steps.length === 0) return state;

      // Swap current step in place
      return replaceChapter(state, active.id, (chapter) => ({
        ...chapter,
        steps: [
          ...chapter.steps.slice(0, -1),
          createStep(action.path, action.label),
        ],
      }));
    }

    case "OPEN_FRESH": {
      // Always creates a new chapter regardless of significance
      const newChapter = createChapter(action.path, action.label);

      return {
        ...state,
        chapters: [...state.chapters, newChapter],
        activeChapterId: newChapter.id,
      };
    }

    case "GO_BACK": {
      const active = getActiveChapter(state);
      if (!active) return state;

      if (active.steps.length > 1) {
        // Pop current step
        return replaceChapter(state, active.id, (chapter) => ({
          ...chapter,
          steps: chapter.steps.slice(0, -1),
        }));
      }

      // At chapter root — close this chapter and return to previous
      const activeIndex = state.chapters.findIndex(
        (c) => c.id === active.id,
      );

      if (state.chapters.length <= 1) {
        // Last chapter — replace with default/home chapter
        const defaultChapter = createChapter(
          config.homePath ?? "/",
          config.homeLabel ?? "Home",
        );
        return {
          ...state,
          chapters: [defaultChapter],
          activeChapterId: defaultChapter.id,
        };
      }

      // Close current chapter, activate the one before it (or after if it was first)
      const remaining = state.chapters.filter((c) => c.id !== active.id);
      const newActive = remaining[Math.max(0, activeIndex - 1)] ?? remaining[0];

      return {
        ...state,
        chapters: remaining,
        activeChapterId: newActive!.id,
      };
    }

    case "OPEN_OR_FOCUS": {
      const targetDomain = extractDomain(action.path);

      // Look for an existing chapter whose domain matches
      const existing = state.chapters.find((c) => c.domain === targetDomain);

      if (existing) {
        // Switch to the existing chapter (no-op if already active)
        if (existing.id === state.activeChapterId) return state;
        return { ...state, activeChapterId: existing.id };
      }

      // No matching chapter — create one (same logic as OPEN_FRESH)
      const newChapter = createChapter(action.path, action.label);
      return {
        ...state,
        chapters: [...state.chapters, newChapter],
        activeChapterId: newChapter.id,
      };
    }

    case "GO_TO_STEP": {
      const chapter = state.chapters.find((c) => c.id === action.chapterId);
      if (!chapter) return state;

      // stepIndex is the step to keep as the new top — truncate everything after
      if (action.stepIndex < 0 || action.stepIndex >= chapter.steps.length) {
        return state;
      }

      return replaceChapter(state, action.chapterId, (ch) => ({
        ...ch,
        steps: ch.steps.slice(0, action.stepIndex + 1),
      }));
    }

    case "CLOSE_CHAPTER": {
      const chapterToClose = state.chapters.find(
        (c) => c.id === action.chapterId,
      );
      if (!chapterToClose) return state;

      if (state.chapters.length <= 1) {
        // Last chapter — replace with default/home chapter
        const defaultChapter = createChapter(
          config.homePath ?? "/",
          config.homeLabel ?? "Home",
        );
        return {
          ...state,
          chapters: [defaultChapter],
          activeChapterId: defaultChapter.id,
        };
      }

      const closingIndex = state.chapters.findIndex(
        (c) => c.id === action.chapterId,
      );
      const remainingChapters = state.chapters.filter(
        (c) => c.id !== action.chapterId,
      );

      // If closing the active chapter, activate the previous (or next)
      let newActiveId = state.activeChapterId;
      if (state.activeChapterId === action.chapterId) {
        const target =
          remainingChapters[Math.max(0, closingIndex - 1)] ??
          remainingChapters[0];
        newActiveId = target!.id;
      }

      return {
        ...state,
        chapters: remainingChapters,
        activeChapterId: newActiveId,
      };
    }

    default:
      return state;
  }
}
