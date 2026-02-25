import { useSearchParams } from "react-router-dom";
import { deviceList, users, companies, services, reports } from "../data";
import { PageHeader, Card } from "../components/shared";
import { AppLink } from "../components/AppLink";

export function DeviceList() {
  const [searchParams] = useSearchParams();
  const companyFilter = searchParams.get("company");
  const serviceFilter = searchParams.get("service");
  const reportFilter = searchParams.get("report");

  let filtered = deviceList;
  let subtitle = "All registered devices";

  if (companyFilter) {
    const company = companies[companyFilter];
    filtered = filtered.filter((d) => d.company === companyFilter);
    if (company) subtitle = `Devices for ${company.name}`;
  }

  if (serviceFilter) {
    const service = services[serviceFilter];
    const ids = service?.linkedDevices ?? [];
    filtered = filtered.filter((d) => ids.includes(d.id));
    if (service) subtitle = `Devices linked to ${service.name}`;
  }

  if (reportFilter) {
    const report = reports[reportFilter];
    const ids = report?.linkedDevices ?? [];
    filtered = filtered.filter((d) => ids.includes(d.id));
    if (report) subtitle = `Devices in ${report.title}`;
  }

  return (
    <div>
      <PageHeader title="Devices" subtitle={subtitle} />
      <Card>
        {filtered.map((d) => {
          const user = users[d.assignedTo];
          return (
            <AppLink
              key={d.id}
              to={`/devices/${d.id}`}
              label={d.name}
              sub={`${d.type} · ${d.status} · ${user?.name ?? "Unassigned"}`}
            />
          );
        })}
        {filtered.length === 0 && (
          <p style={{ padding: "12px", color: "#94a3b8", fontSize: "14px" }}>
            No devices match this filter.
          </p>
        )}
      </Card>
    </div>
  );
}
