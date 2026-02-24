import { useJourneyNavigate } from "journey-stack";

const navItems = [
  { path: "/clients", label: "Clients" },
  { path: "/portfolios", label: "Portfolios" },
  { path: "/funds", label: "Funds" },
  { path: "/research", label: "Research" },
];

export function TopNav() {
  const { openFresh } = useJourneyNavigate();

  return (
    <nav className="top-nav">
      <span className="top-nav-brand">InvestCo</span>
      <div className="top-nav-items">
        {navItems.map((item) => (
          <button
            key={item.path}
            className="top-nav-button"
            onClick={() => openFresh(item.path, item.label)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <span className="top-nav-hint">
        openFresh() — each click starts a new chapter
      </span>
    </nav>
  );
}
