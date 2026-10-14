const TrafficCard = ({
  title,
  value,
  icon,
  description,
}) => {
  return (
    <div className="traffic-card">
      <div className="card-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>

        {description && (
          <small>{description}</small>
        )}
      </div>
    </div>
  );
};

export default TrafficCard;