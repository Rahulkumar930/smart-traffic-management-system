import { useEffect, useState } from "react";
import axios from "axios";

const ManageIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/incidents");

      setIncidents(response.data?.data || response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Unable to load incidents.");

      // Demo data if API is not available
      setIncidents([
        {
          _id: "INC001",
          title: "Vehicle Accident",
          description: "Minor accident causing traffic slowdown.",
          type: "Accident",
          severity: "High",
          status: "Active"
        },
        {
          _id: "INC002",
          title: "Road Maintenance",
          description: "Road maintenance work is in progress.",
          type: "Roadwork",
          severity: "Medium",
          status: "Active"
        },
        {
          _id: "INC003",
          title: "Traffic Signal Failure",
          description: "Traffic signal temporarily unavailable.",
          type: "Signal Failure",
          severity: "High",
          status: "Resolved"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "severity-high";
      case "medium":
        return "severity-medium";
      case "low":
        return "severity-low";
      default:
        return "";
    }
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() === "active"
      ? "status-active"
      : "status-resolved";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Manage Incidents</h1>
          <p>
            Monitor and manage traffic incidents across the city.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchIncidents}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="loading-message">
          Loading incidents...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error} Showing demo data.
        </div>
      )}

      {!loading && (
        <div className="incidents-grid">
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <div
                className="incident-card"
                key={incident._id}
              >
                <div className="incident-card-header">
                  <h3>{incident.title}</h3>

                  <span
                    className={`status-badge ${getStatusClass(
                      incident.status
                    )}`}
                  >
                    {incident.status}
                  </span>
                </div>

                <p className="incident-description">
                  {incident.description}
                </p>

                <div className="incident-details">
                  <div>
                    <strong>Type</strong>
                    <span>{incident.type}</span>
                  </div>

                  <div>
                    <strong>Severity</strong>
                    <span
                      className={getSeverityClass(
                        incident.severity
                      )}
                    >
                      {incident.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              No traffic incidents found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageIncidents;