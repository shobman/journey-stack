import { useCurrentStep } from "journey-stack";
import { useAppNavigate } from "../hooks/useAppNavigate";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "⊞" },
  { path: "/companies", label: "Companies", icon: "◉" },
  { path: "/devices", label: "Devices", icon: "◫" },
  { path: "/services", label: "Services", icon: "△" },
  { path: "/reports", label: "Reports", icon: "◇" },
];

export function TopNav() {
  const step = useCurrentStep();
  const currentPath = step?.path ?? "/dashboard";
  const { openOrFocus, fresh } = useAppNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#0f172a",
        padding: "0 20px",
        height: "48px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "white",
          marginRight: "32px",
          letterSpacing: "-0.02em",
        }}
      >
        Journey Stack
      </div>
      <nav style={{ display: "flex", gap: "2px", height: "100%" }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            currentPath === item.path ||
            currentPath.startsWith(item.path + "/");
          const isDashboard = item.path === "/dashboard";
          return (
            <button
              key={item.path}
              onClick={() =>
                isDashboard
                  ? openOrFocus(item.path, item.label)
                  : fresh(item.path, item.label)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 14px",
                border: "none",
                height: "100%",
                background: "transparent",
                borderBottom: isActive
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
                color: isActive ? "white" : "#94a3b8",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <span style={{ fontSize: "14px" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
