import { useJourneyNavigate } from "journey-stack";
import { deviceList, users } from "../data";

export function DeviceList() {
  const { navigate } = useJourneyNavigate();

  return (
    <div>
      <h1>Devices</h1>
      <div className="card-list">
        {deviceList.map((device) => {
          const user = users[device.assignedTo];
          return (
            <div
              key={device.id}
              className="card"
              onClick={() => navigate(`/devices/${device.id}`, device.name)}
            >
              <h3>{device.name}</h3>
              <p>
                {device.type} &middot;{" "}
                <span className={`status status-${device.status.toLowerCase()}`}>
                  {device.status}
                </span>
              </p>
              <p className="detail-meta">
                Assigned to {user?.name ?? "Unassigned"} &middot; {device.serial}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
