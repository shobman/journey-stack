import { useJourneyNavigate } from "journey-stack";
import { clients, portfolios } from "../data";

export function ClientDetail({ id }: { id: string }) {
  const { navigate } = useJourneyNavigate();
  const client = clients[id];

  if (!client) return <div>Client not found</div>;

  const clientPortfolios = client.portfolioIds.map((pid) => portfolios[pid]);

  return (
    <div>
      <h1>{client.name}</h1>
      <p className="detail-description">{client.description}</p>

      <h2>Portfolios</h2>
      <p className="gesture-note">
        navigate(path, label, {"{"} significant: false {"}"}) — portfolios stay
        in the client chapter
      </p>
      <div className="card-list">
        {clientPortfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className="card"
            onClick={() =>
              navigate(`/portfolios/${portfolio.id}`, portfolio.name, {
                significant: false,
              })
            }
          >
            <h3>{portfolio.name}</h3>
            <p>{portfolio.description}</p>
            <span className="card-action">
              navigate({"{"} significant: false {"}"}) &rarr;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
