import { useEffect, useState } from "react";
import IncidentCard from "../../components/IncidentCard";
import {
  getIncidents,
  createIncident,
  deleteIncident,
} from "../../services/api";

const IncidentManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "Other",
    severity: "Low",
  });

  const loadIncidents = async () => {
    try {
      const response = await getIncidents();
      setIncidents(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createIncident(form);

      setForm({
        title: "",
        description: "",
        location: "",
        type: "Other",
        severity: "Low",
      });

      setShowForm(false);
      loadIncidents();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to report incident"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this incident?")) {
      return;
    }

    try {
      await deleteIncident(id);
      loadIncidents();
    } catch (error) {
      alert("Unable to delete incident");
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Incident Management</h1>
          <p>Report and monitor traffic incidents</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Report Incident
        </button>
      </div>

      {showForm && (
        <form
          className="form-panel"
          onSubmit={handleSubmit}
        >
          <h3>Report Traffic Incident</h3>

          <input
            placeholder="Incident Title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            required
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            required
          />

          <input
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

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
          >
            <option>Accident</option>
            <option>Roadblock</option>
            <option>Vehicle Breakdown</option>
            <option>Construction</option>
            <option>Other</option>
          </select>

          <select
            value={form.severity}
            onChange={(e) =>
              setForm({
                ...form,
                severity: e.target.value,
              })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <button className="primary-btn">
            Submit Incident
          </button>
        </form>
      )}

      <div className="incident-grid">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident._id}
            incident={incident}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {incidents.length === 0 && (
        <div className="empty-state">
          No incidents reported.
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;