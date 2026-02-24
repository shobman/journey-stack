import { companyList } from "../data";
import { PageHeader, Card } from "../components/shared";
import { AppLink } from "../components/AppLink";

export function CompanyList() {
  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="All company accounts — also available in the sidebar"
      />
      <Card>
        {companyList.map((c) => (
          <AppLink
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
