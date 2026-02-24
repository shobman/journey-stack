import { useJourneyNavigate } from "journey-stack";
import { deviceList, serviceList, companyList } from "../data";

export function Dashboard() {
  const { navigate } = useJourneyNavigate();

  const activeDevices = deviceList.filter((d) => d.status === "Active").length;
  const activeServices = serviceList.filter((s) => s.status === "Active").length;
  const repairDevices = deviceList.filter((d) => d.status === "Repair").length;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{deviceList.length}</span>
          <span className="stat-label">Total Devices</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{activeDevices}</span>
          <span className="stat-label">Active Devices</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{repairDevices}</span>
          <span className="stat-label">In Repair</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{activeServices}</span>
          <span className="stat-label">Active Services</span>
        </div>
      </div>

      <h2>Recent Devices</h2>
      <div className="card-list">
        {deviceList.slice(0, 3).map((device) => (
          <div
            key={device.id}
            className="card"
            onClick={() => navigate(`/devices/${device.id}`, device.name)}
          >
            <h3>{device.name}</h3>
            <p>{device.type} &middot; {device.status} &middot; {device.serial}</p>
          </div>
        ))}
      </div>

      <h2>Active Services</h2>
      <div className="card-list">
        {serviceList
          .filter((s) => s.status === "Active")
          .slice(0, 3)
          .map((service) => (
            <div
              key={service.id}
              className="card"
              onClick={() => navigate(`/services/${service.id}`, service.name)}
            >
              <h3>{service.name}</h3>
              <p>{service.type} &middot; {service.cost}</p>
            </div>
          ))}
      </div>

      <h2>Companies</h2>
      <div className="card-list">
        {companyList.map((company) => (
          <div
            key={company.id}
            className="card"
            onClick={() => navigate(`/companies/${company.id}`, company.name)}
          >
            <h3>{company.name}</h3>
            <p>{company.type} &middot; {company.contactName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
