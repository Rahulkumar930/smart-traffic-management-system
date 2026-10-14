import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/dashboard" className="brand">
        🚦 Smart Traffic
      </Link>

      <div className="navbar-right">
        {user && (
          <span className="user-name">
            {user.name}
          </span>
        )}

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;