import { useParams } from "react-router-dom";
import { companies, users, devices, serviceList } from "../data";
import {
  PageHeader,
  Card,
  CrossNavHint,
  SeeAllLink,
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
  const companyServices = serviceList.filter(
    (s) => s.provider === company.id,
  );

  return (
    <div>
      <PageHeader
        title={company.name}
        subtitle={`${company.type} · Contact: ${company.contactName}`}
      />
      <CrossNavHint>
        Device and service links auto-detect cross-domain. Use sidebar links to
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
          <div>
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
            {companyDevices.length > 1 && (
              <SeeAllLink
                to={`/devices?company=${company.id}`}
                label={`Devices for ${company.name}`}
                count={companyDevices.length}
                entityType="devices"
              />
            )}
          </div>
        )}
        {companyServices.length > 0 && (
          <div>
            <Card title="Services" domain="services">
              {companyServices.map((s) => (
                <AppLink
                  key={s.id}
                  to={`/services/${s.id}`}
                  label={s.name}
                  sub={`${s.type} · ${s.cost}`}
                />
              ))}
            </Card>
            {companyServices.length > 1 && (
              <SeeAllLink
                to={`/services?company=${company.id}`}
                label={`Services by ${company.name}`}
                count={companyServices.length}
                entityType="services"
              />
            )}
          </div>
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
