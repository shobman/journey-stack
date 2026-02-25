import { useSearchParams } from "react-router-dom";
import { reportList, services, devices } from "../data";
import { PageHeader, Card } from "../components/shared";
import { AppLink } from "../components/AppLink";

export function ReportList() {
  const [searchParams] = useSearchParams();
  const serviceFilter = searchParams.get("service");
  const deviceFilter = searchParams.get("device");

  let filtered = reportList;
  let subtitle = "All reports and assessments";

  if (serviceFilter) {
    const service = services[serviceFilter];
    filtered = filtered.filter((r) => r.linkedServices.includes(serviceFilter));
    if (service) subtitle = `Reports referencing ${service.name}`;
  }

  if (deviceFilter) {
    const device = devices[deviceFilter];
    filtered = filtered.filter((r) => r.linkedDevices.includes(deviceFilter));
    if (device) subtitle = `Reports referencing ${device.name}`;
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle={subtitle} />
      <Card>
        {filtered.map((r) => (
          <AppLink
            key={r.id}
            to={`/reports/${r.id}`}
            label={r.title}
            sub={`${r.author} · ${r.type}`}
          />
        ))}
        {filtered.length === 0 && (
          <p style={{ padding: "12px", color: "#94a3b8", fontSize: "14px" }}>
            No reports match this filter.
          </p>
        )}
      </Card>
    </div>
  );
}
