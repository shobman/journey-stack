import { deviceList, users } from "../data";
import { PageHeader, Card } from "../components/shared";
import { AppLink } from "../components/AppLink";

export function DeviceList() {
  return (
    <div>
      <PageHeader title="Devices" subtitle="All registered devices" />
      <Card>
        {deviceList.map((d) => {
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
      </Card>
    </div>
  );
}
