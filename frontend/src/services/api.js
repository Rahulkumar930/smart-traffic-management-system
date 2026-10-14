import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smart_traffic_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== AUTH ====================

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// ==================== TRAFFIC ====================

export const getTrafficData = async () => {
  const response = await api.get("/traffic");
  return response.data;
};

export const getTrafficSummary = async () => {
  const response = await api.get("/traffic/summary");
  return response.data;
};

export const createTrafficData = async (data) => {
  const response = await api.post("/traffic", data);
  return response.data;
};

// Machine Learning Traffic Prediction
export const predictTraffic = async (data) => {
  const response = await api.post("/traffic/predict", data);
  return response.data;
};

// ==================== TRAFFIC SIGNALS ====================

export const getSignals = async () => {
  const response = await api.get("/signals");
  return response.data;
};

export const createSignal = async (data) => {
  const response = await api.post("/signals", data);
  return response.data;
};

export const updateSignal = async (id, data) => {
  const response = await api.put(`/signals/${id}`, data);
  return response.data;
};

export const deleteSignal = async (id) => {
  const response = await api.delete(`/signals/${id}`);
  return response.data;
};

// ==================== INCIDENTS ====================

export const getIncidents = async () => {
  const response = await api.get("/incidents");
  return response.data;
};

export const createIncident = async (data) => {
  const response = await api.post("/incidents", data);
  return response.data;
};

export const updateIncident = async (id, data) => {
  const response = await api.put(`/incidents/${id}`, data);
  return response.data;
};

export const deleteIncident = async (id) => {
  const response = await api.delete(`/incidents/${id}`);
  return response.data;
};

// ==================== ROUTES ====================

export const getRoutes = async () => {
  const response = await api.get("/routes");
  return response.data;
};

export const findBestRoute = async (source, destination) => {
  const response = await api.get("/routes/best", {
    params: {
      source,
      destination,
    },
  });

  return response.data;
};

// ==================== ANALYTICS ====================

export const getAnalytics = async () => {
  const response = await api.get("/analytics");
  return response.data;
};

// ==================== DEFAULT API ====================

export default api;