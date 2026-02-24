import { useJourney, useActiveChapter, useJourneyNavigate } from "journey-stack";

export function BackBar() {
  const chapter = useActiveChapter();
  const { chapters } = useJourney();
  const { goBack } = useJourneyNavigate();

  if (!chapter) return null;

  const hasStepHistory = chapter.steps.length > 1;
  const hasPreviousChapter = chapters.length > 1;
  const atChapterRoot = chapter.steps.length === 1;

  const steps = chapter.steps;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 16px",
        background: "#fafbfc",
        borderBottom: "1px solid #f1f5f9",
        fontSize: "12px",
        minHeight: "32px",
      }}
    >
      {(hasStepHistory || (atChapterRoot && hasPreviousChapter)) && (
        <button
          onClick={goBack}
          style={{
            background: "none",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            cursor: "pointer",
            padding: "2px 10px",
            borderRadius: "5px",
            fontSize: "11px",
            fontFamily: "inherit",
            marginRight: "12px",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <span>← Back</span>
        </button>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0",
          overflow: "hidden",
        }}
      >
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <span
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: isLast ? 1 : 0,
              }}
            >
              {i > 0 && (
                <span
                  style={{ margin: "0 5px", color: "#cbd5e1", fontSize: "10px" }}
                >
                  ›
                </span>
              )}
              <span
                style={{
                  color: isLast ? "#334155" : "#94a3b8",
                  fontWeight: isLast ? 500 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: isLast ? "12px" : "11px",
                }}
              >
                {step.label}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
