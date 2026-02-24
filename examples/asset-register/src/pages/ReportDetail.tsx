import { useParams } from "react-router-dom";
import { reports, services } from "../data";
import {
  PageHeader,
  Card,
  RelatedItem,
  CrossNavHint,
} from "../components/shared";

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const report = reports[id!];
  if (!report)
    return (
      <p style={{ color: "#94a3b8", padding: "40px", textAlign: "center" }}>
        Report not found
      </p>
    );

  return (
    <div>
      <PageHeader
        title={report.title}
        subtitle={`By ${report.author} · ${report.type} · ${report.date}`}
      />
      <CrossNavHint>
        Service links auto-detect as cross-domain. Related reports in sidebar
        stay in-chapter.
      </CrossNavHint>
      <Card title="Referenced Services" domain="services">
        {report.linkedServices.map((sid) => {
          const s = services[sid];
          return s ? (
            <RelatedItem
              key={sid}
              to={`/services/${sid}`}
              label={s.name}
              sub={`${s.type} · ${s.status}`}
            />
          ) : null;
        })}
      </Card>
    </div>
  );
}
