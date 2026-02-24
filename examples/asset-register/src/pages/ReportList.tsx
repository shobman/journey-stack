import { reportList } from "../data";
import { PageHeader, Card, RelatedItem } from "../components/shared";

export function ReportList() {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="All reports and assessments"
      />
      <Card>
        {reportList.map((r) => (
          <RelatedItem
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
