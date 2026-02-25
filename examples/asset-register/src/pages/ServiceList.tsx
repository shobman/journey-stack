import { useSearchParams } from "react-router-dom";
import { serviceList, devices, companies, reports } from "../data";
import { PageHeader, Card } from "../components/shared";
import { AppLink } from "../components/AppLink";

export function ServiceList() {
  const [searchParams] = useSearchParams();
  const deviceFilter = searchParams.get("device");
  const companyFilter = searchParams.get("company");
  const reportFilter = searchParams.get("report");

  let filtered = serviceList;
  let subtitle = "All subscriptions and licenses";

  if (deviceFilter) {
    const device = devices[deviceFilter];
    filtered = filtered.filter((s) => s.linkedDevices.includes(deviceFilter));
    if (device) subtitle = `Services for ${device.name}`;
  }

  if (companyFilter) {
    const company = companies[companyFilter];
    filtered = filtered.filter((s) => s.provider === companyFilter);
    if (company) subtitle = `Services provided by ${company.name}`;
  }

  if (reportFilter) {
    const report = reports[reportFilter];
    const ids = report?.linkedServices ?? [];
    filtered = filtered.filter((s) => ids.includes(s.id));
    if (report) subtitle = `Services in ${report.title}`;
  }

  return (
    <div>
      <PageHeader title="Services" subtitle={subtitle} />
      <Card>
        {filtered.map((s) => (
          <AppLink
            key={s.id}
            to={`/services/${s.id}`}
            label={s.name}
            sub={`${s.type} · ${s.status} · ${s.cost}`}
          />
        ))}
        {filtered.length === 0 && (
          <p style={{ padding: "12px", color: "#94a3b8", fontSize: "14px" }}>
            No services match this filter.
          </p>
        )}
      </Card>
    </div>
  );
}
