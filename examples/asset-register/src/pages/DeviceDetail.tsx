import { useJourneyNavigate } from "journey-stack";
import { devices, users, companies, serviceList } from "../data";

export function DeviceDetail({ id }: { id: string }) {
  const { navigate, replace } = useJourneyNavigate();
  const device = devices[id];

  if (!device) return <div>Device not found</div>;

  const assignedUser = users[device.assignedTo];
  const company = companies[device.company];
  const linkedServices = serviceList.filter((s) =>
    s.linkedDevices.includes(device.id),
  );

  return (
    <div>
      <h1>{device.name}</h1>
      <div className="detail-grid">
        <div className="detail-field">
          <span className="detail-label">Type</span>
          <span>{device.type}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Status</span>
          <span className={`status status-${device.status.toLowerCase()}`}>
            {device.status}
          </span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Serial</span>
          <span className="mono">{device.serial}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Purchase Date</span>
          <span>{device.purchaseDate}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Assigned To</span>
          {assignedUser ? (
            <button
              className="cross-link"
              onClick={() => navigate(`/users/${assignedUser.id}`, assignedUser.name)}
            >
              {assignedUser.name}
            </button>
          ) : (
            <span>Unassigned</span>
          )}
        </div>
        <div className="detail-field">
          <span className="detail-label">Company</span>
          {company ? (
            <button
              className="cross-link"
              onClick={() => navigate(`/companies/${company.id}`, company.name)}
            >
              {company.name}
            </button>
          ) : (
            <span>Unknown</span>
          )}
        </div>
      </div>

      {linkedServices.length > 0 && (
        <>
          <h2>Linked Services</h2>
          <p className="gesture-note">
            replace() &mdash; sidebar-style lateral nav, stays in chapter
          </p>
          <div className="card-list">
            {linkedServices.map((service) => (
              <div
                key={service.id}
                className="card"
                onClick={() => replace(`/services/${service.id}`, service.name)}
              >
                <h3>{service.name}</h3>
                <p>{service.type} &middot; {service.cost}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
