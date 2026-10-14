import TrafficData from "../models/TrafficData.js";

export const getLatestTrafficData = async (limit = 10) => {
  return TrafficData.find()
    .sort({ timestamp: -1 })
    .limit(limit);
};

export const getTrafficByRoad = async (roadName) => {
  return TrafficData.find({
    roadName: new RegExp(roadName, "i"),
  }).sort({ timestamp: -1 });
};