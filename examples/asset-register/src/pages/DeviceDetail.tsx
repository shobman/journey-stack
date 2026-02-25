import { useParams } from "react-router-dom";
import { devices, users, companies, serviceList, reportList } from "../data";
import {
  PageHeader,
  Card,
  Badge,
  CrossNavHint,
  SeeAllLink,
} from "../components/shared";
import { AppLink } from "../components/AppLink";

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const device = devices[id!];
  if (!device)
    return (
      <p style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
        Device not found
      </p>
    );

  const assignedUser = users[device.assignedTo];
  const company = companies[device.company];
  const linkedServices = serviceList.filter((s) =>
    s.linkedDevices.includes(device.id),
  );
  const relatedReports = reportList.filter((r) =>
    r.linkedDevices.includes(device.id),
  );

  return (
    <div>
      <PageHeader title={device.name} />
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Badge
          color={
            device.status === "Active"
              ? "#10b981"
              : device.status === "Repair"
                ? "#f59e0b"
                : "#64748b"
          }
        >
          {device.status}
        </Badge>
        <Badge color="#6366f1">{device.type}</Badge>
        <Badge color="#64748b">{device.serial}</Badge>
      </div>
      <CrossNavHint>
        Company and service links auto-detect cross-domain. Use sidebar links to
        stay in-workspace.
      </CrossNavHint>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {linkedServices.length > 0 && (
          <div>
            <Card title="Linked Services" domain="services">
              {linkedServices.map((s) => (
                <AppLink
                  key={s.id}
                  to={`/services/${s.id}`}
                  label={s.name}
                  sub={s.cost}
                />
              ))}
            </Card>
            {linkedServices.length > 1 && (
              <SeeAllLink
                to={`/services?device=${device.id}`}
                label={`Services for ${device.name}`}
                count={linkedServices.length}
                entityType="services"
              />
            )}
          </div>
        )}
        <Card title="Details" domain="devices">
          {company && (
            <AppLink
              to={`/companies/${company.id}`}
              label={company.name}
              sub="Company"
            />
          )}
          {assignedUser && (
            <div style={{ padding: "9px 12px", fontSize: "14px" }}>
              <span style={{ fontWeight: 500 }}>{assignedUser.name}</span>
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginLeft: "12px",
                }}
              >
                {assignedUser.role}
              </span>
            </div>
          )}
          <div
            style={{ padding: "9px 12px", fontSize: "13px", color: "#64748b" }}
          >
            Purchased {device.purchaseDate}
          </div>
        </Card>
        {relatedReports.length > 0 && (
          <div>
            <Card title="Related Reports" domain="reports">
              {relatedReports.map((r) => (
                <AppLink
                  key={r.id}
                  to={`/reports/${r.id}`}
                  label={r.title}
                  sub={r.author}
                />
              ))}
            </Card>
            {relatedReports.length > 1 && (
              <SeeAllLink
                to={`/reports?device=${device.id}`}
                label={`Reports for ${device.name}`}
                count={relatedReports.length}
                entityType="reports"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
