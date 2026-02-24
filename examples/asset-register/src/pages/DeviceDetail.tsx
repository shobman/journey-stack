import { devices, users, companies, serviceList } from "../data";
import {
  PageHeader,
  Card,
  RelatedItem,
  Badge,
  CrossNavHint,
} from "../components/shared";

export function DeviceDetail({ id }: { id: string }) {
  const device = devices[id];
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
        stay in-chapter.
      </CrossNavHint>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {linkedServices.length > 0 && (
          <Card title="Linked Services" domain="services">
            {linkedServices.map((s) => (
              <RelatedItem
                key={s.id}
                to={`/services/${s.id}`}
                label={s.name}
                sub={s.cost}
              />
            ))}
          </Card>
        )}
        <Card title="Details" domain="devices">
          {company && (
            <RelatedItem
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
      </div>
    </div>
  );
}
