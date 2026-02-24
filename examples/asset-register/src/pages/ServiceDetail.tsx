import { useParams } from "react-router-dom";
import { services, companies, devices, reportList } from "../data";
import {
  PageHeader,
  Card,
  RelatedItem,
  Badge,
  CrossNavHint,
} from "../components/shared";

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const service = services[id!];
  if (!service)
    return (
      <p style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
        Service not found
      </p>
    );

  const provider = companies[service.provider];
  const linked = service.linkedDevices
    .map((did) => devices[did])
    .filter(Boolean);
  const relatedReports = reportList.filter((r) =>
    r.linkedServices.includes(service.id),
  );

  return (
    <div>
      <PageHeader
        title={service.name}
        subtitle={`Provider: ${provider?.name ?? "Unknown"} · Renews ${service.renewalDate}`}
      />
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Badge color={service.status === "Active" ? "#10b981" : "#64748b"}>
          {service.status}
        </Badge>
        <Badge color="#6366f1">{service.type}</Badge>
        <Badge color="#64748b">{service.cost}</Badge>
      </div>
      <CrossNavHint>
        Device links auto-detect as cross-domain. Report links open new
        chapters.
      </CrossNavHint>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {linked.length > 0 && (
          <Card title="Linked Devices" domain="devices">
            {linked.map((d) => (
              <RelatedItem
                key={d.id}
                to={`/devices/${d.id}`}
                label={d.name}
                sub={`${d.type} · ${d.status}`}
              />
            ))}
          </Card>
        )}
        {relatedReports.length > 0 && (
          <Card title="Related Reports" domain="reports">
            {relatedReports.map((r) => (
              <RelatedItem
                key={r.id}
                to={`/reports/${r.id}`}
                label={r.title}
                sub={r.author}
              />
            ))}
          </Card>
        )}
        {provider && (
          <Card title="Provider" domain="companies">
            <RelatedItem
              to={`/companies/${provider.id}`}
              label={provider.name}
              sub={provider.type}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
