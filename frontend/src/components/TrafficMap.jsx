import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const TrafficMap = ({ traffic = [] }) => {
  const defaultCenter = [28.6139, 77.209];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="traffic-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {traffic.map((item, index) => {
          const lat = 28.6139 + index * 0.01;
          const lng = 77.209 + index * 0.01;

          return (
            <CircleMarker
              key={item._id || index}
              center={[lat, lng]}
              radius={10}
            >
              <Popup>
                <strong>{item.location}</strong>
                <br />
                Road: {item.roadName}
                <br />
                Vehicles: {item.vehicleCount}
                <br />
                Congestion: {item.congestionLevel}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TrafficMap;