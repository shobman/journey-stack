import { useJourneyNavigate } from "journey-stack";
import {
  portfolioList,
  fundList,
  researchList,
  clients,
} from "../data";

type ListPageProps = {
  domain: "portfolios" | "funds" | "research";
};

export function ListPage({ domain }: ListPageProps) {
  const { navigate } = useJourneyNavigate();

  if (domain === "portfolios") {
    return (
      <div>
        <h1>Portfolios</h1>
        <div className="card-list">
          {portfolioList.map((portfolio) => (
            <div
              key={portfolio.id}
              className="card"
              onClick={() =>
                navigate(
                  `/portfolios/${portfolio.id}`,
                  portfolio.name,
                )
              }
            >
              <h3>{portfolio.name}</h3>
              <p className="detail-meta">
                Client: {clients[portfolio.clientId].name}
              </p>
              <p>{portfolio.description}</p>
              <span className="card-action">navigate() &rarr;</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (domain === "funds") {
    return (
      <div>
        <h1>Funds</h1>
        <div className="card-list">
          {fundList.map((fund) => (
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
              <p className="detail-meta">{fund.category}</p>
              <p>{fund.description}</p>
              <span className="card-action">navigate() &rarr;</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Research</h1>
      <div className="card-list">
        {researchList.map((note) => (
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
            <p>{note.description}</p>
            <span className="card-action">navigate() &rarr;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
