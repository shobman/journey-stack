import { useParams } from "react-router-dom";
import { companies, users, devices } from "../data";
import {
  PageHeader,
  Card,
  CrossNavHint,
} from "../components/shared";
import { AppLink } from "../components/AppLink";

export function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const company = companies[id!];
  if (!company)
    return (
      <p style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
        Company not found
      </p>
    );

  const companyUsers = company.users
    .map((uid) => users[uid])
    .filter(Boolean);
  const companyDevices = company.devices
    .map((did) => devices[did])
    .filter(Boolean);

  return (
    <div>
      <PageHeader
        title={company.name}
        subtitle={`${company.type} · Contact: ${company.contactName}`}
      />
      <CrossNavHint>
        Device links below use auto cross-domain detection. Use sidebar links to
        stay in-workspace.
      </CrossNavHint>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {companyDevices.length > 0 && (
          <Card title="Devices" domain="devices">
            {companyDevices.map((d) => (
              <AppLink
                key={d.id}
                to={`/devices/${d.id}`}
                label={d.name}
                sub={`${d.type} · ${d.status}`}
              />
            ))}
          </Card>
        )}
        {companyUsers.length > 0 && (
          <Card title="Users" domain="companies">
            {companyUsers.map((u) => (
              <div
                key={u.id}
                style={{ padding: "9px 12px", fontSize: "14px" }}
              >
                <span style={{ fontWeight: 500 }}>{u.name}</span>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    marginLeft: "12px",
                  }}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
