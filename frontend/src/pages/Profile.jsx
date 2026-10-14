import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>My Profile</h1>
          <p>Account information</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <h2>{user?.name}</h2>

        <p>{user?.email}</p>

        <div className="profile-role">
          Role: <strong>{user?.role}</strong>
        </div>
      </div>
    </div>
  );
};

export default Profile;