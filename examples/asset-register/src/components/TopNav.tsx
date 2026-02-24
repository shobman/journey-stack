import { useJourneyNavigate } from "journey-stack";

export function TopNav() {
  const { openOrFocus, openFresh } = useJourneyNavigate();

  return (
    <nav className="top-nav">
      <span className="top-nav-brand">IT Assets</span>
      <div className="top-nav-items">
        <button
          className="top-nav-button"
          onClick={() => openOrFocus("/dashboard", "Dashboard")}
        >
          Dashboard
        </button>
        <button
          className="top-nav-button"
          onClick={() => openOrFocus("/devices", "Devices")}
        >
          Devices
        </button>
        <button
          className="top-nav-button"
          onClick={() => openOrFocus("/services", "Services")}
        >
          Services
        </button>
        <button
          className="top-nav-button"
          onClick={() => openOrFocus("/companies", "Companies")}
        >
          Companies
        </button>
        <button
          className="top-nav-button top-nav-accent"
          onClick={() => openFresh("/assets/new", "New Asset")}
        >
          + New Asset
        </button>
      </div>
    </nav>
  );
}
