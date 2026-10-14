const IncidentCard = ({ incident, onDelete }) => {
  return (
    <div className="incident-card">
      <div className="incident-header">
        <h3>{incident.title}</h3>

        <span
          className={`severity ${incident.severity.toLowerCase()}`}
        >
          {incident.severity}
        </span>
      </div>

      <p>{incident.description}</p>

      <p>
        <strong>Location:</strong> {incident.location}
      </p>

      <p>
        <strong>Type:</strong> {incident.type}
      </p>

      <p>
        <strong>Status:</strong> {incident.status}
      </p>

      {onDelete && (
        <button
          className="danger-btn"
          onClick={() => onDelete(incident._id)}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default IncidentCard;