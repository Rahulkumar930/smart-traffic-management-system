import TrafficData from "../models/TrafficData.js";
import TrafficSignal from "../models/TrafficSignal.js";
import Incident from "../models/Incident.js";

export const getAnalytics = async (req, res) => {
  try {
    const [
      trafficCount,
      signalCount,
      incidentCount,
      trafficData,
    ] = await Promise.all([
      TrafficData.countDocuments(),
      TrafficSignal.countDocuments(),
      Incident.countDocuments(),
      TrafficData.find(),
    ]);

    const totalVehicles = trafficData.reduce(
      (sum, item) => sum + item.vehicleCount,
      0
    );

    const averageSpeed =
      trafficData.length > 0
        ? trafficData.reduce(
            (sum, item) => sum + item.averageSpeed,
            0
          ) / trafficData.length
        : 0;

    res.json({
      success: true,
      analytics: {
        trafficRecords: trafficCount,
        trafficSignals: signalCount,
        incidents: incidentCount,
        totalVehicles,
        averageSpeed: Number(averageSpeed.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};