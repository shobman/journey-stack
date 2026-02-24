import { serviceList } from "../data";
import { PageHeader, Card, RelatedItem } from "../components/shared";

export function ServiceList() {
  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="All subscriptions and licenses"
      />
      <Card>
        {serviceList.map((s) => (
          <RelatedItem
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
