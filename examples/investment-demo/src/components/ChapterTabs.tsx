import { useJourney, useJourneyNavigate } from "journey-stack";

export function ChapterTabs() {
  const { chapters, activeChapterId } = useJourney();
  const { openFresh } = useJourneyNavigate();

  if (chapters.length <= 1) return null;

  return (
    <div className="chapter-tabs">
      {chapters.map((chapter) => {
        const isActive = chapter.id === activeChapterId;
        return (
          <div
            key={chapter.id}
            className={`chapter-tab ${isActive ? "chapter-tab-active" : ""}`}
          >
            <button
              className="chapter-tab-button"
              onClick={() => {
                if (!isActive) {
                  const currentStep = chapter.steps[chapter.steps.length - 1];
                  openFresh(currentStep.path, currentStep.label);
                }
              }}
            >
              <span className="chapter-tab-title">{chapter.title}</span>
              <span className="chapter-tab-count">
                {chapter.steps.length} step{chapter.steps.length !== 1 ? "s" : ""}
              </span>
            </button>
          </div>
        );
      })}
      <span className="chapter-tabs-hint">
        chapters — cross-domain navigation creates tabs
      </span>
    </div>
  );
}
