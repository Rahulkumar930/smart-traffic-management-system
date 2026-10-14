import axios from "axios";

export const predictCongestion = async ({
  vehicleCount,
  averageSpeed,
  roadCapacity = 200,
  timeOfDay = new Date().getHours(),
  weather = 0,
  accident = 0,
}) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:5005/predict",
      {
        vehicle_count: Number(vehicleCount),
        average_speed: Number(averageSpeed),
        road_capacity: Number(roadCapacity),
        time_of_day: Number(timeOfDay),
        weather: Number(weather),
        accident: Number(accident),
      }
    );

    return {
      predictedCongestion: response.data.congestionLevel,
      confidence: response.data.confidence,
      prediction: response.data.prediction,
      vehicleCount: Number(vehicleCount),
      averageSpeed: Number(averageSpeed),
    };
  } catch (error) {
    console.error(
      "ML Prediction Error:",
      error.response?.data || error.message
    );

    throw new Error("ML prediction service is unavailable");
  }
};