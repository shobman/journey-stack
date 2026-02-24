import { useJourneyNavigate } from "journey-stack";
import { deviceList, serviceList, companyList } from "../data";

function DashboardSidebar() {
  const { openOrFocus } = useJourneyNavigate();

  return (
    <aside className="sidebar">
      <h3 className="sidebar-header">Quick Links</h3>
      <button className="sidebar-link" onClick={() => openOrFocus("/devices", "Devices")}>
        Devices ({deviceList.length})
      </button>
      <button className="sidebar-link" onClick={() => openOrFocus("/services", "Services")}>
        Services ({serviceList.length})
      </button>
      <button className="sidebar-link" onClick={() => openOrFocus("/companies", "Companies")}>
        Companies ({companyList.length})
      </button>
    </aside>
  );
}

function DevicesSidebar() {
  const { replace, openFresh } = useJourneyNavigate();

  return (
    <aside className="sidebar">
      <h3 className="sidebar-header">Devices</h3>
      <div className="sidebar-actions">
        <button className="sidebar-action" onClick={() => openFresh("/assets/new", "New Asset")}>
          + Add Device
        </button>
      </div>
      {deviceList.map((d) => (
        <button
          key={d.id}
          className="sidebar-link"
          onClick={() => replace(`/devices/${d.id}`, d.name)}
        >
          <span>{d.name}</span>
          <span className="sidebar-meta">{d.type} &middot; {d.status}</span>
        </button>
      ))}
    </aside>
  );
}

function ServicesSidebar() {
  const { replace, openFresh } = useJourneyNavigate();

  return (
    <aside className="sidebar">
      <h3 className="sidebar-header">Services</h3>
      <div className="sidebar-actions">
        <button className="sidebar-action" onClick={() => openFresh("/assets/new", "New Asset")}>
          + Add Service
        </button>
      </div>
      {serviceList.map((s) => (
        <button
          key={s.id}
          className="sidebar-link"
          onClick={() => replace(`/services/${s.id}`, s.name)}
        >
          <span>{s.name}</span>
          <span className="sidebar-meta">{s.type} &middot; {s.status}</span>
        </button>
      ))}
    </aside>
  );
}

function CompaniesSidebar() {
  const { replace, openFresh } = useJourneyNavigate();

  return (
    <aside className="sidebar">
      <h3 className="sidebar-header">Companies</h3>
      <div className="sidebar-actions">
        <button className="sidebar-action" onClick={() => openFresh("/assets/new", "New Asset")}>
          + Add Company
        </button>
      </div>
      {companyList.map((c) => (
        <button
          key={c.id}
          className="sidebar-link"
          onClick={() => replace(`/companies/${c.id}`, c.name)}
        >
          <span>{c.name}</span>
          <span className="sidebar-meta">{c.type}</span>
        </button>
      ))}
    </aside>
  );
}

export function Sidebar({ domain }: { domain: string }) {
  switch (domain) {
    case "dashboard":
      return <DashboardSidebar />;
    case "devices":
      return <DevicesSidebar />;
    case "services":
      return <ServicesSidebar />;
    case "companies":
      return <CompaniesSidebar />;
    default:
      return null;
  }
}
