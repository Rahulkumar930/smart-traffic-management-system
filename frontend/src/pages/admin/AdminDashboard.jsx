import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage the traffic management system</p>
        </div>
      </div>

      <div className="admin-grid">
        <Link
          to="/admin/signals"
          className="admin-card"
        >
          <span>🚦</span>
          <h3>Manage Signals</h3>
          <p>Control traffic signal records</p>
        </Link>

        <Link
          to="/admin/incidents"
          className="admin-card"
        >
          <span>⚠️</span>
          <h3>Manage Incidents</h3>
          <p>Review reported incidents</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;