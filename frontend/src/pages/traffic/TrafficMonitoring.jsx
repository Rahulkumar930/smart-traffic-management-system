import { useEffect, useState } from "react";
import TrafficCard from "../../components/TrafficCard";
import {
  getTrafficData,
  createTrafficData,
} from "../../services/api";

const TrafficMonitoring = () => {
  const [traffic, setTraffic] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    location: "",
    road: "",
    vehicles: "",
    avgSpeed: "",
  });

  const loadTraffic = async () => {
    try {
      const response = await getTrafficData();

      console.log("Traffic API response:", response.data);

      // Handle both direct array and { data: [] } responses
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setTraffic(data);
    } catch (error) {
      console.error("Error loading traffic data:", error);
    }
  };

  useEffect(() => {
    loadTraffic();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTrafficData({
        location: form.location,
        road: form.road,
        vehicles: Number(form.vehicles),
        avgSpeed: Number(form.avgSpeed),
      });

      setForm({
        location: "",
        road: "",
        vehicles: "",
        avgSpeed: "",
      });

      setShowForm(false);

      await loadTraffic();
    } catch (error) {
      console.error("Add traffic error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to add traffic data"
      );
    }
  };

  // Calculate total vehicles correctly
  const totalVehicles = traffic.reduce(
    (sum, item) => sum + Number(item.vehicles || 0),
    0
  );

  // Count High and Severe congestion
  const highCongestion = traffic.filter(
    (item) =>
      item.congestion === "High" ||
      item.congestion === "Severe"
  ).length;

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <h1>Traffic Monitoring</h1>
          <p>
            Monitor traffic flow and congestion levels
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Traffic Data
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="card-grid">
        <TrafficCard
          title="Traffic Records"
          value={traffic.length}
          icon="📊"
        />

        <TrafficCard
          title="Total Vehicles"
          value={totalVehicles}
          icon="🚗"
        />

        <TrafficCard
          title="High Congestion"
          value={highCongestion}
          icon="🔴"
        />
      </div>

      {/* ADD TRAFFIC FORM */}
      {showForm && (
        <form
          className="form-panel"
          onSubmit={handleSubmit}
        >
          <h3>Add Traffic Data</h3>

          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Road Name"
            value={form.road}
            onChange={(e) =>
              setForm({
                ...form,
                road: e.target.value,
              })
            }
            required
          />

          <input
            type="number"
            placeholder="Vehicle Count"
            value={form.vehicles}
            onChange={(e) =>
              setForm({
                ...form,
                vehicles: e.target.value,
              })
            }
            required
            min="0"
          />

          <input
            type="number"
            placeholder="Average Speed (km/h)"
            value={form.avgSpeed}
            onChange={(e) =>
              setForm({
                ...form,
                avgSpeed: e.target.value,
              })
            }
            required
            min="0"
          />

          <button
            type="submit"
            className="primary-btn"
          >
            Save Traffic Data
          </button>
        </form>
      )}

      {/* TRAFFIC TABLE */}
      <div className="table-container">
        <h3>Traffic Records</h3>

        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Road</th>
              <th>Vehicles</th>
              <th>Avg Speed</th>
              <th>Congestion</th>
            </tr>
          </thead>

          <tbody>
            {traffic.map((item) => (
              <tr key={item._id}>
                <td>{item.location}</td>

                <td>{item.road}</td>

                <td>{item.vehicles}</td>

                <td>
                  {item.avgSpeed} km/h
                </td>

                <td>
                  <span
                    className={`status-badge ${
                      String(
                        item.congestion || "Low"
                      ).toLowerCase()
                    }`}
                  >
                    {item.congestion || "Low"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {traffic.length === 0 && (
          <p className="empty-state">
            No traffic data available.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrafficMonitoring;