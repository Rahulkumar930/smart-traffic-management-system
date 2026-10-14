const SignalStatus = ({ signal }) => {
  return (
    <div className="signal-card">
      <div className="signal-header">
        <h3>{signal.signalId}</h3>

        <span
          className={`signal-badge ${signal.status.toLowerCase()}`}
        >
          {signal.status}
        </span>
      </div>

      <p>{signal.location}</p>
      <p>{signal.roadName}</p>

      <div className="signal-times">
        <span>
          🟢 {signal.greenTime}s
        </span>

        <span>
          🔴 {signal.redTime}s
        </span>

        <span>
          🟡 {signal.yellowTime}s
        </span>
      </div>
    </div>
  );
};

export default SignalStatus;