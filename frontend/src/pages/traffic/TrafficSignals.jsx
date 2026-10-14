import { useEffect, useState } from "react";
import SignalStatus from "../../components/SignalStatus";
import { getSignals } from "../../services/api";

const TrafficSignals = () => {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const response = await getSignals();
        setSignals(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadSignals();
  }, []);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Traffic Signals</h1>
          <p>Monitor traffic signal conditions</p>
        </div>
      </div>

      <div className="signal-grid">
        {signals.map((signal) => (
          <SignalStatus
            key={signal._id}
            signal={signal}
          />
        ))}
      </div>

      {signals.length === 0 && (
        <div className="empty-state">
          No traffic signals found.
        </div>
      )}
    </div>
  );
};

export default TrafficSignals;