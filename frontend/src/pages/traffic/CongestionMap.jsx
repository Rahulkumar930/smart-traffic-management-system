import { useEffect, useState } from "react";
import TrafficMap from "../../components/TrafficMap";
import { getTrafficData } from "../../services/api";

const CongestionMap = () => {
  const [traffic, setTraffic] = useState([]);

  useEffect(() => {
    getTrafficData()
      .then((response) => {
        setTraffic(response.data || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Congestion Map</h1>
          <p>Visualize traffic congestion across the city</p>
        </div>
      </div>

      <TrafficMap traffic={traffic} />
    </div>
  );
};

export default CongestionMap;