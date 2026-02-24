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

function activeFromFocusStack(focusStack: string[]): string {
  return focusStack[focusStack.length - 1];
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
    focusStack: [chapter.id],
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
        const newFocusStack = [...state.focusStack, newChapter.id];

        return {
          ...state,
          chapters: [...state.chapters, newChapter],
          focusStack: newFocusStack,
          activeChapterId: activeFromFocusStack(newFocusStack),
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
      const newFocusStack = [...state.focusStack, newChapter.id];

      return {
        ...state,
        chapters: [...state.chapters, newChapter],
        focusStack: newFocusStack,
        activeChapterId: activeFromFocusStack(newFocusStack),
      };
    }

    case "GO_BACK": {
      const active = getActiveChapter(state);
      if (!active) return state;

      if (active.steps.length > 1) {
        // Pop current step — focusStack unchanged
        return replaceChapter(state, active.id, (chapter) => ({
          ...chapter,
          steps: chapter.steps.slice(0, -1),
        }));
      }

      // At chapter root — close this chapter, previous in focusStack becomes active
      if (state.chapters.length <= 1) {
        // Last chapter — replace with default/home chapter
        const defaultChapter = createChapter(
          config.homePath ?? "/",
          config.homeLabel ?? "Home",
        );
        const newFocusStack = [defaultChapter.id];
        return {
          ...state,
          chapters: [defaultChapter],
          focusStack: newFocusStack,
          activeChapterId: activeFromFocusStack(newFocusStack),
        };
      }

      const remainingChapters = state.chapters.filter((c) => c.id !== active.id);
      const newFocusStack = state.focusStack.filter((id) => id !== active.id);

      return {
        ...state,
        chapters: remainingChapters,
        focusStack: newFocusStack,
        activeChapterId: activeFromFocusStack(newFocusStack),
      };
    }

    case "OPEN_OR_FOCUS": {
      const targetDomain = extractDomain(action.path);

      // Look for an existing chapter whose domain matches
      const existing = state.chapters.find((c) => c.domain === targetDomain);

      if (existing) {
        // Focus existing — move to end of focusStack, chapters unchanged
        if (existing.id === state.activeChapterId) return state;
        const newFocusStack = [
          ...state.focusStack.filter((id) => id !== existing.id),
          existing.id,
        ];
        return {
          ...state,
          focusStack: newFocusStack,
          activeChapterId: activeFromFocusStack(newFocusStack),
        };
      }

      // No matching chapter — create one
      const newChapter = createChapter(action.path, action.label);
      const newFocusStack = [...state.focusStack, newChapter.id];
      return {
        ...state,
        chapters: [...state.chapters, newChapter],
        focusStack: newFocusStack,
        activeChapterId: activeFromFocusStack(newFocusStack),
      };
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
        const newFocusStack = [defaultChapter.id];
        return {
          ...state,
          chapters: [defaultChapter],
          focusStack: newFocusStack,
          activeChapterId: activeFromFocusStack(newFocusStack),
        };
      }

      const remainingChapters = state.chapters.filter(
        (c) => c.id !== action.chapterId,
      );
      const newFocusStack = state.focusStack.filter(
        (id) => id !== action.chapterId,
      );

      return {
        ...state,
        chapters: remainingChapters,
        focusStack: newFocusStack,
        activeChapterId: activeFromFocusStack(newFocusStack),
      };
    }

    case "FOCUS_CHAPTER": {
      const target = state.chapters.find((c) => c.id === action.chapterId);
      if (!target || target.id === state.activeChapterId) return state;
      // Move to end of focusStack — chapters array unchanged
      const newFocusStack = [
        ...state.focusStack.filter((id) => id !== target.id),
        target.id,
      ];
      return {
        ...state,
        focusStack: newFocusStack,
        activeChapterId: activeFromFocusStack(newFocusStack),
      };
    }

    default:
      return state;
  }
}
