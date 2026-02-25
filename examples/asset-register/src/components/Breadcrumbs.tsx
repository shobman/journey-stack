import { useJourney, useActiveWorkspace } from "journey-stack";
import { useAppNavigate } from "../hooks/useAppNavigate";

export function Breadcrumbs() {
  const workspace = useActiveWorkspace();
  const { workspaces } = useJourney();
  const { back } = useAppNavigate();

  if (!workspace) return null;

  const hasStepHistory = workspace.steps.length > 1;
  const hasPreviousWorkspace = workspaces.length > 1;
  const atWorkspaceRoot = workspace.steps.length === 1;

  const steps = workspace.steps;

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
      {(hasStepHistory || (atWorkspaceRoot && hasPreviousWorkspace)) && (
        <button
          onClick={() => back()}
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
          const popCount = steps.length - 1 - i;
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
              {isLast ? (
                <span
                  style={{
                    color: "#334155",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "12px",
                  }}
                >
                  {step.label}
                </span>
              ) : (
                <button
                  onClick={() => back(popCount)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "#94a3b8",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "11px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#3b82f6";
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  {step.label}
                </button>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
