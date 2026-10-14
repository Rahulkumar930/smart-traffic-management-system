import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        Traffic Control
      </div>

      <nav>
        <NavLink to="/dashboard">📊 Dashboard</NavLink>

        <NavLink to="/traffic-monitoring">
          🚗 Traffic Monitoring
        </NavLink>

        <NavLink to="/congestion-map">
          🗺️ Congestion Map
        </NavLink>

        <NavLink to="/traffic-signals">
          🚦 Traffic Signals
        </NavLink>

        <NavLink to="/route-optimization">
          🛣️ Route Optimization
        </NavLink>

        <NavLink to="/incidents">
          ⚠️ Incidents
        </NavLink>

        <NavLink to="/analytics">
          📈 Analytics
        </NavLink>

        <NavLink to="/predictions">
          🔮 Predictions
        </NavLink>

        <NavLink to="/profile">
          👤 Profile
        </NavLink>

        {user?.role === "admin" && (
          <>
            <div className="sidebar-section">
              ADMIN
            </div>

            <NavLink to="/admin">
              ⚙️ Admin Dashboard
            </NavLink>

            <NavLink to="/admin/signals">
              🚦 Manage Signals
            </NavLink>

            <NavLink to="/admin/incidents">
              ⚠️ Manage Incidents
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;