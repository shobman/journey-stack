import { useJourneyNavigate } from "journey-stack";
import { users, companies, devices } from "../data";

export function UserDetail({ id }: { id: string }) {
  const { navigate } = useJourneyNavigate();
  const user = users[id];

  if (!user) return <div>User not found</div>;

  const company = companies[user.company];
  const userDevices = user.devices.map((did) => devices[did]).filter(Boolean);

  return (
    <div>
      <h1>{user.name}</h1>
      <div className="detail-grid">
        <div className="detail-field">
          <span className="detail-label">Role</span>
          <span>{user.role}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Email</span>
          <span className="mono">{user.email}</span>
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

      {userDevices.length > 0 && (
        <>
          <h2>Assigned Devices</h2>
          <p className="gesture-note">
            navigate() &mdash; cross-domain link to devices chapter
          </p>
          <div className="card-list">
            {userDevices.map((device) => (
              <div
                key={device.id}
                className="card"
                onClick={() => navigate(`/devices/${device.id}`, device.name)}
              >
                <h3>{device.name}</h3>
                <p>{device.type} &middot; {device.status} &middot; {device.serial}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
