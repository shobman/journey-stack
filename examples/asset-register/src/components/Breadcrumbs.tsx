import { useActiveChapter, useJourneyNavigate } from "journey-stack";

export function Breadcrumbs() {
  const chapter = useActiveChapter();
  const { goBack, goToStep } = useJourneyNavigate();

  if (!chapter || chapter.steps.length <= 1) return null;

  const steps = chapter.steps;

  return (
    <div className="breadcrumb-bar">
      <button className="back-button" onClick={goBack}>
        &larr; Back
      </button>
      <div className="breadcrumbs">
        {steps.map((step, i) => {
          const isCurrent = i === steps.length - 1;
          return (
            <span key={step.id} className="breadcrumb-item">
              {i > 0 && <span className="breadcrumb-separator">/</span>}
              <span
                className={`breadcrumb-label ${isCurrent ? "breadcrumb-current" : ""}`}
              >
                {step.label}
              </span>
              {!isCurrent && (
                <button
                  className="breadcrumb-close"
                  onClick={() => goToStep(chapter.id, i)}
                  title="Go back to this step"
                >
                  &times;
                </button>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
