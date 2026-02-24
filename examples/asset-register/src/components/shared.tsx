import type { ReactNode } from "react";
import { useJourneyNavigate, useCurrentStep } from "journey-stack";

export const DOMAIN_COLORS: Record<string, string> = {
  dashboard: "#64748b",
  companies: "#0ea5e9",
  devices: "#8b5cf6",
  services: "#10b981",
  reports: "#f59e0b",
};

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{ margin: 0, fontSize: "22px", color: "#0f172a", fontWeight: 700 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Card({
  title,
  domain,
  children,
}: {
  title?: string;
  domain?: string;
  children: ReactNode;
}) {
  const color = domain ? DOMAIN_COLORS[domain] : undefined;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "16px",
        borderTop: color ? `3px solid ${color}` : undefined,
      }}
    >
      {title && (
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: "12px",
            color: color || "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          {title}
        </h3>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {children}
      </div>
    </div>
  );
}

export function Badge({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <span
      style={{
        background: color + "15",
        color,
        padding: "3px 10px",
        borderRadius: "100px",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function RelatedItem({
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
  const { navigate } = useJourneyNavigate();
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
          navigate(to, label, { significant });
        }}
        style={{
          background: "none",
          border: "none",
          color: "#3b82f6",
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

export function CrossNavHint({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 8px",
        fontSize: "13px",
        color: "#c4b5fd",
        fontStyle: "italic",
      }}
    >
      {children}
    </p>
  );
}

export function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <div
        style={{
          padding: "6px 12px 4px",
          fontSize: "10px",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function SidebarAction({
  label,
  icon,
}: {
  label: string;
  icon?: string;
}) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "7px 12px",
        border: "none",
        borderRadius: "6px",
        borderLeft: "3px solid transparent",
        background: "transparent",
        color: "#64748b",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "inherit",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#fef3c7";
        e.currentTarget.style.color = "#92400e";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#64748b";
      }}
    >
      {icon && <span style={{ fontSize: "11px", opacity: 0.7 }}>{icon}</span>}
      {label}
    </button>
  );
}

export function SidebarLink({
  to,
  label,
  children,
  icon,
}: {
  to: string;
  label: string;
  children?: ReactNode;
  icon?: string;
}) {
  const { replace } = useJourneyNavigate();
  const step = useCurrentStep();
  const currentPath = step?.path ?? "/dashboard";
  const isActive = currentPath === to;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        replace(to, label);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "8px 12px",
        border: "none",
        borderRadius: "6px",
        borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
        background: isActive ? "#eff6ff" : "transparent",
        color: isActive ? "#1e40af" : "#475569",
        cursor: "pointer",
        fontSize: "13px",
        fontFamily: "inherit",
        textAlign: "left",
        fontWeight: isActive ? 600 : 400,
        transition: "all 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "#f8fafc";
          e.currentTarget.style.color = "#1e293b";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#475569";
        }
      }}
    >
      {icon && (
        <span
          style={{
            fontSize: "12px",
            width: "16px",
            textAlign: "center",
            flexShrink: 0,
            opacity: 0.7,
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {children || label}
      </span>
    </button>
  );
}
