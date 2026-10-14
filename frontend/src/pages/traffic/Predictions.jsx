import { useState } from "react";
import { predictTraffic } from "../../services/api";

const Predictions = () => {
  const [formData, setFormData] = useState({
    vehicleCount: "",
    averageSpeed: "",
    roadCapacity: "200",
    timeOfDay: "18",
    weather: "0",
    accident: "0",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await predictTraffic({
        vehicleCount: Number(formData.vehicleCount),
        averageSpeed: Number(formData.averageSpeed),
        roadCapacity: Number(formData.roadCapacity),
        timeOfDay: Number(formData.timeOfDay),
        weather: Number(formData.weather),
        accident: Number(formData.accident),
      });

      setResult(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to get traffic prediction."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1>Traffic Predictions</h1>
          <p>
            Predict urban traffic congestion using Machine Learning
          </p>
        </div>
      </div>

      {/* Prediction Form */}
      <div className="prediction-form-card">
        <h2>Traffic Prediction</h2>

        <p>
          Enter current traffic conditions to predict congestion.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* Vehicle Count */}
            <div className="form-group">
              <label>Vehicle Count</label>

              <input
                type="number"
                name="vehicleCount"
                value={formData.vehicleCount}
                onChange={handleChange}
                placeholder="Example: 220"
                min="0"
                required
              />
            </div>

            {/* Average Speed */}
            <div className="form-group">
              <label>Average Speed (km/h)</label>

              <input
                type="number"
                name="averageSpeed"
                value={formData.averageSpeed}
                onChange={handleChange}
                placeholder="Example: 20"
                min="0"
                required
              />
            </div>

            {/* Road Capacity */}
            <div className="form-group">
              <label>Road Capacity</label>

              <input
                type="number"
                name="roadCapacity"
                value={formData.roadCapacity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            {/* Time */}
            <div className="form-group">
              <label>Time of Day (0-23)</label>

              <input
                type="number"
                name="timeOfDay"
                value={formData.timeOfDay}
                onChange={handleChange}
                min="0"
                max="23"
              />
            </div>

            {/* Weather */}
            <div className="form-group">
              <label>Weather</label>

              <select
                name="weather"
                value={formData.weather}
                onChange={handleChange}
              >
                <option value="0">Clear</option>
                <option value="1">Rain</option>
                <option value="2">Fog</option>
              </select>
            </div>

            {/* Accident */}
            <div className="form-group">
              <label>Accident</label>

              <select
                name="accident"
                value={formData.accident}
                onChange={handleChange}
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="predict-button"
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict Traffic"}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="prediction-result-card">
          <h2>Prediction Result</h2>

          <div className="prediction-result">
            <span>Predicted Congestion</span>

            <strong>
              {result.predictedCongestion}
            </strong>
          </div>

          <div className="prediction-details">

            <div>
              <span>Confidence</span>
              <strong>
                {result.confidence}%
              </strong>
            </div>

            <div>
              <span>Vehicle Count</span>
              <strong>
                {result.vehicleCount}
              </strong>
            </div>

            <div>
              <span>Average Speed</span>
              <strong>
                {result.averageSpeed} km/h
              </strong>
            </div>

            <div>
              <span>ML Prediction</span>
              <strong>
                {result.prediction}
              </strong>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;