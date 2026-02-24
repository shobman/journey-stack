import { useJourneyNavigate } from "journey-stack";
import { clientList } from "../data";

export function ClientList() {
  const { navigate } = useJourneyNavigate();

  return (
    <div>
      <h1>Clients</h1>
      <div className="card-list">
        {clientList.map((client) => (
          <div
            key={client.id}
            className="card"
            onClick={() =>
              navigate(`/clients/${client.id}`, client.name)
            }
          >
            <h3>{client.name}</h3>
            <p>{client.description}</p>
            <span className="card-action">
              navigate() &rarr;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
