import { reportList } from "../data";
import { PageHeader, Card } from "../components/shared";
import { AppLink } from "../components/AppLink";

export function ReportList() {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="All reports and assessments"
      />
      <Card>
        {reportList.map((r) => (
          <AppLink
            key={r.id}
            to={`/reports/${r.id}`}
            label={r.title}
            sub={`${r.author} · ${r.type}`}
          />
        ))}
      </Card>
    </div>
  );
}
