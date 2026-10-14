import TrafficSignal from "../models/TrafficSignal.js";

export const getSignals = async (req, res) => {
  try {
    const signals = await TrafficSignal.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: signals.length,
      data: signals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSignalById = async (req, res) => {
  try {
    const signal = await TrafficSignal.findById(req.params.id);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Traffic signal not found",
      });
    }

    res.json({
      success: true,
      data: signal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createSignal = async (req, res) => {
  try {
    const signal = await TrafficSignal.create(req.body);

    res.status(201).json({
      success: true,
      message: "Traffic signal created",
      data: signal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSignal = async (req, res) => {
  try {
    const signal = await TrafficSignal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Traffic signal not found",
      });
    }

    res.json({
      success: true,
      message: "Traffic signal updated",
      data: signal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSignal = async (req, res) => {
  try {
    const signal = await TrafficSignal.findByIdAndDelete(
      req.params.id
    );

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: "Traffic signal not found",
      });
    }

    res.json({
      success: true,
      message: "Traffic signal deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};