import { useState } from "react";
import { useJourney } from "journey-stack";
import { devices, services, companies, reports } from "../data";
import { DOMAIN_COLORS } from "./shared";

function resolveEntity(path: string) {
  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const [domain, id] = segments;

  switch (domain) {
    case "devices": {
      const d = devices[id];
      if (!d) return null;
      return {
        type: "Device",
        name: d.name,
        metrics: { Type: d.type, Status: d.status, Serial: d.serial },
      };
    }
    case "services": {
      const s = services[id];
      if (!s) return null;
      return {
        type: "Service",
        name: s.name,
        metrics: { Type: s.type, Status: s.status, Cost: s.cost },
      };
    }
    case "companies": {
      const c = companies[id];
      if (!c) return null;
      return {
        type: "Company",
        name: c.name,
        metrics: { Type: c.type, Contact: c.contactName },
      };
    }
    case "reports": {
      const r = reports[id];
      if (!r) return null;
      return {
        type: "Report",
        name: r.title,
        metrics: { Type: r.type, Author: r.author },
      };
    }
    default:
      return null;
  }
}

export function ComparePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { workspaces } = useJourney();

  if (workspaces.length < 2) return null;

  return (
    <div
      style={{
        borderTop: "1px solid #e2e8f0",
        marginTop: "auto",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "none",
          background: isOpen ? "#f0f9ff" : "transparent",
          color: "#3b82f6",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "inherit",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = "#f8fafc";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{ fontSize: "14px" }}>{isOpen ? "▾" : "▸"}</span>
        Compare Workspaces ({workspaces.length})
      </button>

      {isOpen && (
        <div style={{ padding: "0 10px 10px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {workspaces.map((ws) => {
              const currentStep = ws.steps[ws.steps.length - 1];
              const entity = resolveEntity(currentStep.path);
              const domainColor =
                DOMAIN_COLORS[ws.domain] || "#64748b";

              return (
                <div
                  key={ws.id}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    borderLeft: `3px solid ${domainColor}`,
                    padding: "8px 10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: domainColor,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {ws.title}
                  </div>
                  {entity ? (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: "2px",
                        }}
                      >
                        {entity.name}
                      </div>
                      {Object.entries(entity.metrics).map(([k, v]) => (
                        <div
                          key={k}
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                          }}
                        >
                          <span style={{ color: "#94a3b8" }}>{k}:</span>{" "}
                          {v}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                      }}
                    >
                      {currentStep.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            style={{
              width: "100%",
              padding: "6px 10px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              background: "#ffffff",
              color: "#3b82f6",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              fontFamily: "inherit",
              textAlign: "center",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f0f9ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            Launch full compare &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
