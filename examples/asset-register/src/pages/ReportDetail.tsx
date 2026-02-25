import { useParams } from "react-router-dom";
import { reports, services, devices } from "../data";
import {
  PageHeader,
  Card,
  CrossNavHint,
  SeeAllLink,
} from "../components/shared";
import { AppLink } from "../components/AppLink";

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const report = reports[id!];
  if (!report)
    return (
      <p style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
        Report not found
      </p>
    );

  const linkedServices = report.linkedServices
    .map((sid) => services[sid])
    .filter(Boolean);
  const linkedDevices = report.linkedDevices
    .map((did) => devices[did])
    .filter(Boolean);

  return (
    <div>
      <PageHeader
        title={report.title}
        subtitle={`By ${report.author} · ${report.type} · ${report.date}`}
      />
      <CrossNavHint>
        Service and device links auto-detect as cross-domain.
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
            <Card title="Referenced Services" domain="services">
              {linkedServices.map((s) => (
                <AppLink
                  key={s.id}
                  to={`/services/${s.id}`}
                  label={s.name}
                  sub={`${s.type} · ${s.status}`}
                />
              ))}
            </Card>
            {linkedServices.length > 1 && (
              <SeeAllLink
                to={`/services?report=${report.id}`}
                label={`Services in ${report.title}`}
                count={linkedServices.length}
                entityType="services"
              />
            )}
          </div>
        )}
        {linkedDevices.length > 0 && (
          <div>
            <Card title="Referenced Devices" domain="devices">
              {linkedDevices.map((d) => (
                <AppLink
                  key={d.id}
                  to={`/devices/${d.id}`}
                  label={d.name}
                  sub={`${d.type} · ${d.status}`}
                />
              ))}
            </Card>
            {linkedDevices.length > 1 && (
              <SeeAllLink
                to={`/devices?report=${report.id}`}
                label={`Devices in ${report.title}`}
                count={linkedDevices.length}
                entityType="devices"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
