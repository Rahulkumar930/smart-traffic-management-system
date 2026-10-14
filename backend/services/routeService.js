import Route from "../models/Route.js";

export const getRecommendedRoutes = async (
  source,
  destination
) => {
  return Route.find({
    source: new RegExp(source, "i"),
    destination: new RegExp(destination, "i"),
  }).sort({
    estimatedTime: 1,
    congestionLevel: 1,
  });
};