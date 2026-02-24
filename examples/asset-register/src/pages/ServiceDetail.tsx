import { useJourneyNavigate } from "journey-stack";
import { services, companies, devices } from "../data";

export function ServiceDetail({ id }: { id: string }) {
  const { navigate } = useJourneyNavigate();
  const service = services[id];

  if (!service) return <div>Service not found</div>;

  const provider = companies[service.provider];
  const linked = service.linkedDevices.map((did) => devices[did]).filter(Boolean);

  return (
    <div>
      <h1>{service.name}</h1>
      <div className="detail-grid">
        <div className="detail-field">
          <span className="detail-label">Type</span>
          <span>{service.type}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Status</span>
          <span className={`status status-${service.status.toLowerCase()}`}>
            {service.status}
          </span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Cost</span>
          <span className="mono">{service.cost}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Renewal</span>
          <span>{service.renewalDate}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Provider</span>
          {provider ? (
            <button
              className="cross-link"
              onClick={() => navigate(`/companies/${provider.id}`, provider.name)}
            >
              {provider.name}
            </button>
          ) : (
            <span>Unknown</span>
          )}
        </div>
      </div>

      {linked.length > 0 && (
        <>
          <h2>Linked Devices</h2>
          <p className="gesture-note">
            navigate() &mdash; cross-domain link, creates a new chapter
          </p>
          <div className="card-list">
            {linked.map((device) => (
              <div
                key={device.id}
                className="card"
                onClick={() => navigate(`/devices/${device.id}`, device.name)}
              >
                <h3>{device.name}</h3>
                <p>{device.type} &middot; {device.status}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
