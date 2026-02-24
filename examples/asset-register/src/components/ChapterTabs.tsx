import { useJourney, useJourneyNavigate } from "journey-stack";

export function ChapterTabs() {
  const { chapters, activeChapterId } = useJourney();
  const { openOrFocus, openFresh, closeChapter } = useJourneyNavigate();

  if (chapters.length <= 1) return null;

  return (
    <div className="chapter-tabs">
      {chapters.map((chapter) => {
        const isActive = chapter.id === activeChapterId;
        const currentStep = chapter.steps[chapter.steps.length - 1];
        return (
          <div
            key={chapter.id}
            className={`chapter-tab ${isActive ? "chapter-tab-active" : ""}`}
          >
            <button
              className="chapter-tab-button"
              onClick={() => {
                if (!isActive) {
                  // For persistent domains, use openOrFocus to find existing chapter
                  // For assets domain (New Asset), use openFresh since they're ephemeral
                  if (chapter.domain === "assets") {
                    openFresh(currentStep.path, currentStep.label);
                  } else {
                    openOrFocus(currentStep.path, chapter.title);
                  }
                }
              }}
            >
              <span className="chapter-tab-title">{chapter.title}</span>
              <span className="chapter-tab-count">
                {chapter.steps.length} step{chapter.steps.length !== 1 ? "s" : ""}
              </span>
            </button>
            <button
              className="chapter-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeChapter(chapter.id);
              }}
              title="Close chapter"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
