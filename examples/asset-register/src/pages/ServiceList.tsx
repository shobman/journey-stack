import { useJourneyNavigate } from "journey-stack";
import { serviceList, companies } from "../data";

export function ServiceList() {
  const { navigate } = useJourneyNavigate();

  return (
    <div>
      <h1>Services</h1>
      <div className="card-list">
        {serviceList.map((service) => {
          const provider = companies[service.provider];
          return (
            <div
              key={service.id}
              className="card"
              onClick={() => navigate(`/services/${service.id}`, service.name)}
            >
              <h3>{service.name}</h3>
              <p>
                {service.type} &middot;{" "}
                <span className={`status status-${service.status.toLowerCase()}`}>
                  {service.status}
                </span>
                {" "}&middot; {service.cost}
              </p>
              <p className="detail-meta">
                Provider: {provider?.name ?? "Unknown"} &middot; Renews {service.renewalDate}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
