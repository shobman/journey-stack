import { useJourneyNavigate } from "journey-stack";
import { portfolios, funds, clients } from "../data";

export function PortfolioDetail({ id }: { id: string }) {
  const { navigate } = useJourneyNavigate();
  const portfolio = portfolios[id];

  if (!portfolio) return <div>Portfolio not found</div>;

  const client = clients[portfolio.clientId];
  const holdingFunds = portfolio.fundIds.map((fid) => funds[fid]);

  return (
    <div>
      <h1>{portfolio.name}</h1>
      <p className="detail-meta">Client: {client.name}</p>
      <p className="detail-description">{portfolio.description}</p>

      <h2>Fund Holdings</h2>
      <p className="gesture-note">
        navigate() — cross-domain links auto-create a new chapter
      </p>
      <div className="card-list">
        {holdingFunds.map((fund) => (
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
