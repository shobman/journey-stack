import { useState } from "react";
import { useJourneyBlock } from "journey-stack";

export function NewAsset() {
  const [isDirty, setIsDirty] = useState(false);
  const [assetType, setAssetType] = useState("device");

  useJourneyBlock((_action) => {
    if (!isDirty) return true;
    return window.confirm("You have unsaved changes. Leave?");
  });

  return (
    <div>
      <h1>New Asset</h1>
      <p className="gesture-note">
        openFresh() &mdash; each click creates a new chapter. Try clicking
        "New Asset" again in the nav bar.
      </p>

      <div className="form-card">
        <div className="form-field">
          <label className="form-label">Asset Type</label>
          <select
            className="form-input"
            value={assetType}
            onChange={(e) => {
              setAssetType(e.target.value);
              setIsDirty(true);
            }}
          >
            <option value="device">Device</option>
            <option value="service">Service</option>
            <option value="company">Company</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            type="text"
            placeholder={`Enter ${assetType} name`}
            onChange={() => setIsDirty(true)}
          />
        </div>

        {assetType === "device" && (
          <>
            <div className="form-field">
              <label className="form-label">Device Type</label>
              <select className="form-input" onChange={() => setIsDirty(true)}>
                <option value="">Select type</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Phone">Phone</option>
                <option value="Tablet">Tablet</option>
                <option value="Server">Server</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Serial Number</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter serial number"
                onChange={() => setIsDirty(true)}
              />
            </div>
          </>
        )}

        {assetType === "service" && (
          <>
            <div className="form-field">
              <label className="form-label">Service Type</label>
              <select className="form-input" onChange={() => setIsDirty(true)}>
                <option value="">Select type</option>
                <option value="SaaS">SaaS</option>
                <option value="PaaS">PaaS</option>
                <option value="IaaS">IaaS</option>
                <option value="License">License</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Cost</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. $5,000/yr"
                onChange={() => setIsDirty(true)}
              />
            </div>
          </>
        )}

        {assetType === "company" && (
          <>
            <div className="form-field">
              <label className="form-label">Company Type</label>
              <select className="form-input" onChange={() => setIsDirty(true)}>
                <option value="">Select type</option>
                <option value="Vendor">Vendor</option>
                <option value="Client">Client</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Contact Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="contact@example.com"
                onChange={() => setIsDirty(true)}
              />
            </div>
          </>
        )}

        <button className="form-submit" onClick={() => setIsDirty(false)}>
          Save Asset
        </button>

        {isDirty && (
          <p className="form-dirty-note">
            useJourneyBlock() is active &mdash; closing this chapter will prompt confirmation
          </p>
        )}
      </div>
    </div>
  );
}
