import { useState, useRef, useEffect } from "react";
import { useJourney } from "journey-stack";
import type { JourneyWorkspace } from "journey-stack";
import { useAppNavigate } from "../hooks/useAppNavigate";
import { DOMAIN_COLORS } from "./shared";

export function WorkspaceTabBar() {
  const { workspaces, activeWorkspaceId } = useJourney();
  const { openOrFocus, closeWorkspace, focusWorkspace } = useAppNavigate();
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollLeft = tabContainerRef.current.scrollWidth;
    }
  }, [workspaces.length]);

  const handleCloseAll = () => {
    const toClose = workspaces.filter((c) => c.domain !== "dashboard");
    toClose.forEach((c) => closeWorkspace(c.id));
    openOrFocus("/dashboard", "Dashboard");
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        position: "relative",
      }}
    >
      <div
        ref={tabContainerRef}
        style={{
          display: "flex",
          alignItems: "stretch",
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: "0 8px",
          gap: "2px",
        }}
      >
        {workspaces.map((workspace) => {
          const isActive = workspace.id === activeWorkspaceId;
          const domainColor = DOMAIN_COLORS[workspace.domain] || "#64748b";
          return (
            <WorkspaceTab
              key={workspace.id}
              workspace={workspace}
              isActive={isActive}
              domainColor={domainColor}
              onFocus={() => {
                focusWorkspace(workspace.id);
              }}
              onClose={(e) => {
                e.stopPropagation();
                closeWorkspace(workspace.id);
              }}
            />
          );
        })}
        {workspaces.length > 1 && (
          <button
            onClick={handleCloseAll}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "8px 12px",
              fontSize: "11px",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              flexShrink: 0,
              alignSelf: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            Close all
          </button>
        )}
      </div>
    </div>
  );
}

function WorkspaceTab({
  workspace,
  isActive,
  domainColor,
  onFocus,
  onClose,
}: {
  workspace: JourneyWorkspace;
  isActive: boolean;
  domainColor: string;
  onFocus: () => void;
  onClose: (e: React.MouseEvent) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const stepCount = workspace.steps.length;

  return (
    <div style={{ position: "relative", flexShrink: 0 }} ref={dropdownRef}>
      <div
        onClick={onFocus}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 8px 8px 12px",
          cursor: "pointer",
          borderBottom: isActive
            ? `2px solid ${domainColor}`
            : "2px solid transparent",
          background: isActive ? "#f8fafc" : "transparent",
          transition: "all 0.15s",
          maxWidth: "200px",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "#f8fafc";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: domainColor,
            flexShrink: 0,
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (stepCount > 1) setShowDropdown(!showDropdown);
            onFocus();
          }}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: "12px",
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "#0f172a" : "#64748b",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "130px",
            textAlign: "left",
          }}
        >
          {workspace.title}
        </button>
        {stepCount > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
              onFocus();
            }}
            style={{
              background: isActive ? domainColor + "20" : "#f1f5f9",
              color: isActive ? domainColor : "#94a3b8",
              border: "none",
              borderRadius: "100px",
              padding: "1px 5px",
              fontSize: "10px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            {stepCount}
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0 2px",
            fontSize: "13px",
            fontFamily: "inherit",
            lineHeight: "1",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          ×
        </button>
      </div>
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 200,
            minWidth: "220px",
            maxHeight: "300px",
            overflowY: "auto",
            padding: "4px",
            marginTop: "2px",
          }}
        >
          <div
            style={{
              padding: "6px 10px 4px",
              fontSize: "10px",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            History in {workspace.title}
          </div>
          {workspace.steps.map((step, i) => {
            const isCurrent = i === workspace.steps.length - 1;
            return (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "6px",
                  background: isCurrent ? domainColor + "10" : "transparent",
                  color: isCurrent ? domainColor : "#334155",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  textAlign: "left",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                <span
                  style={{
                    color: "#cbd5e1",
                    fontSize: "11px",
                    width: "16px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {isCurrent ? "›" : `${i + 1}`}
                </span>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
