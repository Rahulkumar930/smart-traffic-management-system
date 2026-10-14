export const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString();
};

export const getCongestionClass = (level) => {
  return level?.toLowerCase() || "low";
};

export const getCongestionLabel = (vehicleCount) => {
  if (vehicleCount >= 150) return "Severe";
  if (vehicleCount >= 100) return "High";
  if (vehicleCount >= 50) return "Medium";

  return "Low";
};