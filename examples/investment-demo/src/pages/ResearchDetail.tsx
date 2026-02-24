import { useJourneyNavigate } from "journey-stack";
import { research, funds } from "../data";

export function ResearchDetail({ id }: { id: string }) {
  const { navigate } = useJourneyNavigate();
  const note = research[id];

  if (!note) return <div>Research not found</div>;

  const referencedFunds = note.fundIds.map((fid) => funds[fid]);

  return (
    <div>
      <h1>{note.title}</h1>
      <p className="detail-meta">
        {note.author} &middot; {note.date}
      </p>
      <p className="detail-description">{note.description}</p>

      <h2>Referenced Funds</h2>
      <p className="gesture-note">
        navigate() — cross-domain link back to funds
      </p>
      <div className="card-list">
        {referencedFunds.map((fund) => (
          <div
            key={fund.id}
            className="card"
            onClick={() =>
              navigate(`/funds/${fund.id}`, fund.name)
            }
          >
            <h3>
              {fund.name} <span className="ticker">{fund.ticker}</span>
            </h3>
            <p>{fund.category}</p>
            <span className="card-action">
              navigate() &rarr;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
