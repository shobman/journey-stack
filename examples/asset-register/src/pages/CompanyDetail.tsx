import { useJourneyNavigate } from "journey-stack";
import { companies, users, devices } from "../data";

export function CompanyDetail({ id }: { id: string }) {
  const { navigate } = useJourneyNavigate();
  const company = companies[id];

  if (!company) return <div>Company not found</div>;

  const companyUsers = company.users.map((uid) => users[uid]).filter(Boolean);
  const companyDevices = company.devices.map((did) => devices[did]).filter(Boolean);

  return (
    <div>
      <h1>{company.name}</h1>
      <div className="detail-grid">
        <div className="detail-field">
          <span className="detail-label">Type</span>
          <span>{company.type}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Contact</span>
          <span>{company.contactName}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Email</span>
          <span className="mono">{company.contactEmail}</span>
        </div>
      </div>

      {companyUsers.length > 0 && (
        <>
          <h2>Users</h2>
          <div className="card-list">
            {companyUsers.map((user) => (
              <div
                key={user.id}
                className="card"
                onClick={() => navigate(`/users/${user.id}`, user.name)}
              >
                <h3>{user.name}</h3>
                <p>{user.role} &middot; {user.email}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {companyDevices.length > 0 && (
        <>
          <h2>Devices</h2>
          <p className="gesture-note">
            navigate() &mdash; cross-domain link to devices chapter
          </p>
          <div className="card-list">
            {companyDevices.map((device) => (
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
