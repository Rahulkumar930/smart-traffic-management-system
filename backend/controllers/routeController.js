import Route from "../models/Route.js";

export const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({
      recommended: -1,
      estimatedTime: 1,
    });

    res.json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const findBestRoute = async (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: "Source and destination are required",
      });
    }

    const routes = await Route.find({
      source: new RegExp(source, "i"),
      destination: new RegExp(destination, "i"),
    }).sort({
      congestionLevel: 1,
      estimatedTime: 1,
    });

    res.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);

    res.status(201).json({
      success: true,
      message: "Route created",
      data: route,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};