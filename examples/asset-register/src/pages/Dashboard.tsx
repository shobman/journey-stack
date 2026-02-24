import {
  deviceList,
  serviceList,
  companyList,
  reportList,
} from "../data";
import { PageHeader, Card, RelatedItem } from "../components/shared";

export function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your overview. Sidebar shows quick access — in-page links may cross domains."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <Card title="Top Companies" domain="companies">
          {companyList.slice(0, 3).map((c) => (
            <RelatedItem
              key={c.id}
              to={`/companies/${c.id}`}
              label={c.name}
              sub={c.type}
            />
          ))}
        </Card>
        <Card title="Recent Devices" domain="devices">
          {deviceList.slice(0, 3).map((d) => (
            <RelatedItem
              key={d.id}
              to={`/devices/${d.id}`}
              label={d.name}
              sub={`${d.type} · ${d.status}`}
            />
          ))}
        </Card>
        <Card title="Active Services" domain="services">
          {serviceList
            .filter((s) => s.status === "Active")
            .slice(0, 3)
            .map((s) => (
              <RelatedItem
                key={s.id}
                to={`/services/${s.id}`}
                label={s.name}
                sub={s.cost}
              />
            ))}
        </Card>
        <Card title="Recent Reports" domain="reports">
          {reportList.map((r) => (
            <RelatedItem
              key={r.id}
              to={`/reports/${r.id}`}
              label={r.title}
              sub={r.date}
            />
          ))}
        </Card>
      </div>
    </div>
  );
}
