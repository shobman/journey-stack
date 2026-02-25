import { useActiveWorkspace } from "journey-stack";
import {
  deviceList,
  serviceList,
  companyList,
  reportList,
} from "../data";
import {
  DOMAIN_COLORS,
  SidebarSection,
  SidebarAction,
  SidebarLink,
} from "./shared";

export function SideNav() {
  const workspace = useActiveWorkspace();
  const domainColor =
    DOMAIN_COLORS[workspace?.domain ?? "dashboard"] || "#64748b";
  const domain = workspace?.domain || "dashboard";

  return (
    <div
      style={{
        width: "220px",
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "4px",
          }}
        >
          Workspace
        </div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: domainColor }}>
          {workspace?.title || "Dashboard"}
        </div>
      </div>

      <div
        style={{
          padding: "8px 6px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          flex: 1,
        }}
      >
        {domain === "dashboard" && <DashboardSidebar />}
        {domain === "companies" && <CompaniesSidebar />}
        {domain === "devices" && <DevicesSidebar />}
        {domain === "services" && <ServicesSidebar />}
        {domain === "reports" && <ReportsSidebar />}
      </div>

      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #f1f5f9",
          marginTop: "auto",
        }}
      >
        <div style={{ fontSize: "10px", color: "#cbd5e1" }}>
          Sidebar stays stable within workspace
        </div>
      </div>
    </div>
  );
}

function DashboardSidebar() {
  return (
    <SidebarSection title="Quick Access">
      <SidebarLink to="/companies" label="All Companies" icon="◉">
        All Companies
      </SidebarLink>
      <SidebarLink to="/devices" label="All Devices" icon="◫">
        All Devices
      </SidebarLink>
      <SidebarLink to="/services" label="All Services" icon="△">
        All Services
      </SidebarLink>
      <SidebarLink to="/reports" label="All Reports" icon="◇">
        All Reports
      </SidebarLink>
    </SidebarSection>
  );
}

function CompaniesSidebar() {
  return (
    <>
      <SidebarSection title="Companies">
        <SidebarLink to="/companies" label="All Companies" icon="≡">
          All Companies
        </SidebarLink>
      </SidebarSection>
      <SidebarSection title="Accounts">
        {companyList.map((c) => (
          <SidebarLink
            key={c.id}
            to={`/companies/${c.id}`}
            label={c.name}
            icon="·"
          >
            {c.name}
          </SidebarLink>
        ))}
      </SidebarSection>
      <SidebarSection title="Actions">
        <SidebarAction label="New Company" icon="+" />
        <SidebarAction label="Import Accounts" icon="↑" />
        <SidebarAction label="Company Report" icon="▸" />
      </SidebarSection>
    </>
  );
}

function DevicesSidebar() {
  return (
    <>
      <SidebarSection title="Devices">
        <SidebarLink to="/devices" label="All Devices" icon="≡">
          All Devices
        </SidebarLink>
      </SidebarSection>
      <SidebarSection title="Inventory">
        {deviceList.map((d) => (
          <SidebarLink
            key={d.id}
            to={`/devices/${d.id}`}
            label={d.name}
            icon="·"
          >
            {d.name}
          </SidebarLink>
        ))}
      </SidebarSection>
      <SidebarSection title="Actions">
        <SidebarAction label="New Device" icon="+" />
        <SidebarAction label="Bulk Import" icon="↑" />
        <SidebarAction label="Audit Devices" icon="▸" />
      </SidebarSection>
    </>
  );
}

function ServicesSidebar() {
  return (
    <>
      <SidebarSection title="Services">
        <SidebarLink to="/services" label="All Services" icon="≡">
          All Services
        </SidebarLink>
      </SidebarSection>
      <SidebarSection title="Subscriptions">
        {serviceList.map((s) => (
          <SidebarLink
            key={s.id}
            to={`/services/${s.id}`}
            label={s.name}
            icon="·"
          >
            {s.name}
          </SidebarLink>
        ))}
      </SidebarSection>
      <SidebarSection title="By Type">
        <SidebarAction label="SaaS" icon="›" />
        <SidebarAction label="PaaS" icon="›" />
        <SidebarAction label="IaaS" icon="›" />
        <SidebarAction label="License" icon="›" />
      </SidebarSection>
    </>
  );
}

function ReportsSidebar() {
  return (
    <>
      <SidebarSection title="Reports">
        <SidebarLink to="/reports" label="All Reports" icon="≡">
          All Reports
        </SidebarLink>
      </SidebarSection>
      <SidebarSection title="Notes">
        {reportList.map((r) => (
          <SidebarLink
            key={r.id}
            to={`/reports/${r.id}`}
            label={r.title}
            icon="·"
          >
            {r.title}
          </SidebarLink>
        ))}
      </SidebarSection>
      <SidebarSection title="By Type">
        <SidebarAction label="Security" icon="›" />
        <SidebarAction label="Cost Analysis" icon="›" />
        <SidebarAction label="Compliance" icon="›" />
        <SidebarAction label="Audit" icon="›" />
      </SidebarSection>
    </>
  );
}
