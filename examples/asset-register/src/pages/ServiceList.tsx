import { serviceList } from "../data";
import { PageHeader, Card } from "../components/shared";
import { AppLink } from "../components/AppLink";

export function ServiceList() {
  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="All subscriptions and licenses"
      />
      <Card>
        {serviceList.map((s) => (
          <AppLink
            key={s.id}
            to={`/services/${s.id}`}
            label={s.name}
            sub={`${s.type} · ${s.status} · ${s.cost}`}
          />
        ))}
      </Card>
    </div>
  );
}
