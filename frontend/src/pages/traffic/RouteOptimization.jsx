import { useState } from "react";
import { findBestRoute } from "../../services/api";

const RouteOptimization = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!source.trim() || !destination.trim()) {
      alert("Please enter source and destination");
      return;
    }

    setLoading(true);
    setRoutes([]);

    try {
      const response = await findBestRoute(
        source.trim(),
        destination.trim()
      );

      console.log("Route response:", response);

      /*
       * findBestRoute() in api.js already returns response.data.
       *
       * Support both possible backend formats:
       * 1. Direct array:
       *    [...]
       *
       * 2. Object:
       *    { data: [...] }
       */
      let routeData = [];

      if (Array.isArray(response)) {
        routeData = response;
      } else if (Array.isArray(response?.data)) {
        routeData = response.data;
      } else if (Array.isArray(response?.routes)) {
        routeData = response.routes;
      }

      setRoutes(routeData);

      if (routeData.length === 0) {
        alert(
          "No route recommendations found for this source and destination."
        );
      }
    } catch (error) {
      console.error("Route search error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to find routes. Please check the backend server."
      );

      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <h1>Route Optimization</h1>
          <p>Find routes with lower congestion</p>
        </div>
      </div>

      {/* SEARCH FORM */}
      <form
        className="search-panel"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) =>
            setDestination(e.target.value)
          }
          required
        />

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
        >
          {loading ? "Searching..." : "Find Route"}
        </button>
      </form>

      {/* ROUTE RESULTS */}
      <div className="route-list">
        {routes.map((route, index) => (
          <div
            className="route-card"
            key={route._id || index}
          >
            <h3>
              {route.source || source} →{" "}
              {route.destination || destination}
            </h3>

            <div className="route-info">
              <span>
                📏 {route.distance ?? 0} km
              </span>

              <span>
                ⏱️ {route.estimatedTime ?? 0} min
              </span>

              <span>
                🚦 {route.congestionLevel || "Unknown"}
              </span>
            </div>

            {route.recommended && (
              <span className="recommended">
                ⭐ Recommended Route
              </span>
            )}
          </div>
        ))}
      </div>

      {/* NO RESULTS */}
      {!loading && routes.length === 0 && (
        <div className="empty-state">
          Search for a route to see recommendations.
        </div>
      )}
    </div>
  );
};

export default RouteOptimization;