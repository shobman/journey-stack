import { useJourneyNavigate } from "journey-stack";
import { funds, research as researchData } from "../data";

export function FundDetail({ id }: { id: string }) {
  const { navigate, replace } = useJourneyNavigate();
  const fund = funds[id];

  if (!fund) return <div>Fund not found</div>;

  const relatedFunds = fund.relatedFundIds.map((fid) => funds[fid]);
  const relatedResearch = fund.researchIds.map((rid) => researchData[rid]);

  return (
    <div className="fund-layout">
      <div className="fund-main">
        <h1>
          {fund.name} <span className="ticker">{fund.ticker}</span>
        </h1>
        <p className="detail-meta">{fund.category}</p>
        <p className="detail-description">{fund.description}</p>

        <h2>Research</h2>
        <p className="gesture-note">
          navigate() — cross-domain link to research creates a new chapter
        </p>
        <div className="card-list">
          {relatedResearch.map((note) => (
            <div
              key={note.id}
              className="card"
              onClick={() =>
                navigate(`/research/${note.id}`, note.title)
              }
            >
              <h3>{note.title}</h3>
              <p className="detail-meta">
                {note.author} &middot; {note.date}
              </p>
              <span className="card-action">
                navigate() &rarr;
              </span>
            </div>
          ))}
        </div>
      </div>

      <aside className="fund-sidebar">
        <h3>Related Funds</h3>
        <p className="gesture-note">
          replace() — lateral navigation swaps the current step
        </p>
        {relatedFunds.map((related) => (
          <button
            key={related.id}
            className="sidebar-link"
            onClick={() =>
              replace(`/funds/${related.id}`, related.name)
            }
          >
            <span>{related.name}</span>
            <span className="ticker">{related.ticker}</span>
            <span className="card-action">replace()</span>
          </button>
        ))}
      </aside>
    </div>
  );
}
