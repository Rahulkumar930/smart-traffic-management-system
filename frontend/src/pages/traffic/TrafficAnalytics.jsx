import { useEffect, useState } from "react";
import TrafficChart from "../../components/TrafficChart";
import TrafficCard from "../../components/TrafficCard";
import { getAnalytics } from "../../services/api";

const TrafficAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then((response) => {
        setAnalytics(response.analytics);
      })
      .catch(console.error);
  }, []);

  const chartData = analytics
    ? [
        {
          name: "Traffic",
          value: analytics.trafficRecords,
        },
        {
          name: "Signals",
          value: analytics.trafficSignals,
        },
        {
          name: "Incidents",
          value: analytics.incidents,
        },
      ]
    : [];

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Traffic Analytics</h1>
          <p>Analyze urban traffic performance</p>
        </div>
      </div>

      <div className="card-grid">
        <TrafficCard
          title="Traffic Records"
          value={analytics?.trafficRecords || 0}
          icon="📊"
        />

        <TrafficCard
          title="Total Vehicles"
          value={analytics?.totalVehicles || 0}
          icon="🚗"
        />

        <TrafficCard
          title="Average Speed"
          value={`${analytics?.averageSpeed || 0} km/h`}
          icon="⚡"
        />

        <TrafficCard
          title="Incidents"
          value={analytics?.incidents || 0}
          icon="⚠️"
        />
      </div>

      <TrafficChart data={chartData} />
    </div>
  );
};

export default TrafficAnalytics;