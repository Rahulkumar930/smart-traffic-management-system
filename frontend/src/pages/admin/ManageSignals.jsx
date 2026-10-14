import { useEffect, useState } from "react";
import {
  getSignals,
  createSignal,
  deleteSignal,
} from "../../services/api";

const ManageSignals = () => {
  const [signals, setSignals] = useState([]);

  const [form, setForm] = useState({
    signalId: "",
    location: "",
    roadName: "",
    status: "Red",
    greenTime: 30,
    redTime: 30,
    yellowTime: 5,
  });

  const loadSignals = async () => {
    const response = await getSignals();
    setSignals(response.data || []);
  };

  useEffect(() => {
    loadSignals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createSignal({
        ...form,
        greenTime: Number(form.greenTime),
        redTime: Number(form.redTime),
        yellowTime: Number(form.yellowTime),
      });

      setForm({
        signalId: "",
        location: "",
        roadName: "",
        status: "Red",
        greenTime: 30,
        redTime: 30,
        yellowTime: 5,
      });

      loadSignals();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to create signal"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this signal?")) return;

    try {
      await deleteSignal(id);
      loadSignals();
    } catch (error) {
      alert("Unable to delete signal");
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Manage Traffic Signals</h1>
          <p>Administration of traffic signal systems</p>
        </div>
      </div>

      <form
        className="form-panel"
        onSubmit={handleSubmit}
      >
        <h3>Add Signal</h3>

        <input
          placeholder="Signal ID"
          value={form.signalId}
          onChange={(e) =>
            setForm({
              ...form,
              signalId: e.target.value,
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

        <input
          placeholder="Road Name"
          value={form.roadName}
          onChange={(e) =>
            setForm({
              ...form,
              roadName: e.target.value,
            })
          }
          required
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
        >
          <option>Red</option>
          <option>Yellow</option>
          <option>Green</option>
        </select>

        <input
          type="number"
          placeholder="Green Time"
          value={form.greenTime}
          onChange={(e) =>
            setForm({
              ...form,
              greenTime: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Red Time"
          value={form.redTime}
          onChange={(e) =>
            setForm({
              ...form,
              redTime: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Yellow Time"
          value={form.yellowTime}
          onChange={(e) =>
            setForm({
              ...form,
              yellowTime: e.target.value,
            })
          }
        />

        <button className="primary-btn">
          Add Signal
        </button>
      </form>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Road</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {signals.map((signal) => (
              <tr key={signal._id}>
                <td>{signal.signalId}</td>
                <td>{signal.location}</td>
                <td>{signal.roadName}</td>
                <td>{signal.status}</td>
                <td>
                  <button
                    className="danger-btn"
                    onClick={() =>
                      handleDelete(signal._id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSignals;