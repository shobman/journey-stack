import { companyList } from "../data";
import { PageHeader, Card, RelatedItem } from "../components/shared";

export function CompanyList() {
  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="All company accounts — also available in the sidebar"
      />
      <Card>
        {companyList.map((c) => (
          <RelatedItem
            key={c.id}
            to={`/companies/${c.id}`}
            label={c.name}
            sub={`${c.type} · ${c.contactName}`}
          />
        ))}
      </Card>
    </div>
  );
}
