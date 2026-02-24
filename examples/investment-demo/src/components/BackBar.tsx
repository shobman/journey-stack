import { useActiveChapter, useJourneyNavigate } from "journey-stack";

export function BackBar() {
  const chapter = useActiveChapter();
  const { goBack } = useJourneyNavigate();

  if (!chapter || chapter.steps.length <= 1) return null;

  const steps = chapter.steps;
  const showEllipsis = steps.length > 4;
  const visibleSteps = showEllipsis
    ? [steps[0], ...steps.slice(-3)]
    : steps;

  return (
    <div className="back-bar">
      <button className="back-button" onClick={goBack}>
        &larr; Back
      </button>
      <div className="breadcrumbs">
        {visibleSteps.map((step, i) => (
          <span key={step.id} className="breadcrumb-item">
            {i === 0 && showEllipsis && visibleSteps.length > 1 && (
              <>
                <span className="breadcrumb-label">{step.label}</span>
                <span className="breadcrumb-separator">&hellip;</span>
              </>
            )}
            {!(i === 0 && showEllipsis) && (
              <>
                {i > 0 && <span className="breadcrumb-separator">/</span>}
                <span
                  className={`breadcrumb-label ${
                    i === visibleSteps.length - 1 ? "breadcrumb-current" : ""
                  }`}
                >
                  {step.label}
                </span>
              </>
            )}
          </span>
        ))}
      </div>
      <span className="back-bar-hint">goBack() — pops the current step</span>
    </div>
  );
}
