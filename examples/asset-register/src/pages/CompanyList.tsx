import { useJourneyNavigate } from "journey-stack";
import { companyList } from "../data";

export function CompanyList() {
  const { navigate } = useJourneyNavigate();

  return (
    <div>
      <h1>Companies</h1>
      <div className="card-list">
        {companyList.map((company) => (
          <div
            key={company.id}
            className="card"
            onClick={() => navigate(`/companies/${company.id}`, company.name)}
          >
            <h3>{company.name}</h3>
            <p>
              {company.type} &middot; {company.contactName}
            </p>
            <p className="detail-meta">{company.contactEmail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
