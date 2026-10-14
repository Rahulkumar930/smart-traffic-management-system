import TrafficSignal from "../models/TrafficSignal.js";

export const getActiveSignals = async () => {
  return TrafficSignal.find({
    isActive: true,
  });
};

export const changeSignalStatus = async (signalId, status) => {
  return TrafficSignal.findByIdAndUpdate(
    signalId,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );
};