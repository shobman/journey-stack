import { useWillBranch } from "journey-stack";
import { useAppNavigate } from "../hooks/useAppNavigate";

export function AppLink({
  to,
  label,
  sub,
  significant,
}: {
  to: string;
  label: string;
  sub?: string;
  significant?: boolean;
}) {
  const { push } = useAppNavigate();
  const willBranch = useWillBranch(to, significant);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "9px 12px",
        borderRadius: "8px",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#f8fafc";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          push(to, label, { significant });
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "none",
          border: "none",
          color: willBranch ? "#7c3aed" : "#3b82f6",
          cursor: "pointer",
          padding: 0,
          fontSize: "14px",
          fontFamily: "inherit",
          textDecoration: "none",
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = "underline";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = "none";
        }}
      >
        {label}
        {willBranch && (
          <span
            style={{
              fontSize: "11px",
              opacity: 0.7,
              flexShrink: 0,
            }}
          >
            ↗
          </span>
        )}
      </button>
      {sub && (
        <span
          style={{
            color: "#94a3b8",
            fontSize: "13px",
            flexShrink: 0,
            marginLeft: "12px",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
