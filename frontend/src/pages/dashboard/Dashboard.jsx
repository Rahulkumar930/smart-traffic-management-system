import { useEffect, useState } from "react";
import TrafficCard from "../../components/TrafficCard";
import TrafficChart from "../../components/TrafficChart";
import {
  getTrafficSummary,
  getSignals,
  getIncidents,
} from "../../services/api";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [signals, setSignals] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          trafficResponse,
          signalResponse,
          incidentResponse,
        ] = await Promise.all([
          getTrafficSummary(),
          getSignals(),
          getIncidents(),
        ]);

        setSummary(trafficResponse.summary);
        setSignals(signalResponse.data || []);
        setIncidents(incidentResponse.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard"
        );
      }
    };

    loadDashboard();
  }, []);

  const chartData = summary
    ? [
        {
          name: "Low",
          value: summary.low,
        },
        {
          name: "Medium",
          value: summary.medium,
        },
        {
          name: "High",
          value: summary.high,
        },
        {
          name: "Severe",
          value: summary.severe,
        },
      ]
    : [];

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Traffic Dashboard</h1>
          <p>
            Real-time overview of urban traffic conditions
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="card-grid">
        <TrafficCard
          title="Total Vehicles"
          value={summary?.totalVehicles || 0}
          icon="🚗"
          description="Recorded traffic"
        />

        <TrafficCard
          title="Traffic Records"
          value={summary?.totalRecords || 0}
          icon="📊"
        />

        <TrafficCard
          title="Active Signals"
          value={signals.length}
          icon="🚦"
        />

        <TrafficCard
          title="Incidents"
          value={incidents.length}
          icon="⚠️"
        />
      </div>

      <div className="dashboard-grid">
        <TrafficChart data={chartData} />

        <div className="dashboard-panel">
          <h3>Current Status</h3>

          <div className="status-row">
            <span>🟢 Low Congestion</span>
            <strong>{summary?.low || 0}</strong>
          </div>

          <div className="status-row">
            <span>🟡 Medium Congestion</span>
            <strong>{summary?.medium || 0}</strong>
          </div>

          <div className="status-row">
            <span>🟠 High Congestion</span>
            <strong>{summary?.high || 0}</strong>
          </div>

          <div className="status-row">
            <span>🔴 Severe Congestion</span>
            <strong>{summary?.severe || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;