import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";

import TrafficMonitoring from "./pages/traffic/TrafficMonitoring";
import TrafficSignals from "./pages/traffic/TrafficSignals";
import CongestionMap from "./pages/traffic/CongestionMap";
import RouteOptimization from "./pages/traffic/RouteOptimization";
import IncidentManagement from "./pages/traffic/IncidentManagement";
import TrafficAnalytics from "./pages/traffic/TrafficAnalytics";
import Predictions from "./pages/traffic/Predictions";

// Lane Detection
import LaneDetection from "./pages/LaneDetection";

import Profile from "./pages/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageSignals from "./pages/admin/ManageSignals";
import ManageIncidents from "./pages/admin/ManageIncidents";

import "./App.css";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="main-layout">
        <Sidebar />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              PROTECTED ROUTES
          ========================== */}

          <Route element={<ProtectedRoute />}>

            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            {/* Traffic Monitoring */}

            <Route
              path="/traffic-monitoring"
              element={
                <Layout>
                  <TrafficMonitoring />
                </Layout>
              }
            />

            {/* Traffic Signals */}

            <Route
              path="/traffic-signals"
              element={
                <Layout>
                  <TrafficSignals />
                </Layout>
              }
            />

            {/* Congestion Map */}

            <Route
              path="/congestion-map"
              element={
                <Layout>
                  <CongestionMap />
                </Layout>
              }
            />

            {/* Route Optimization */}

            <Route
              path="/route-optimization"
              element={
                <Layout>
                  <RouteOptimization />
                </Layout>
              }
            />

            {/* Incident Management */}

            <Route
              path="/incidents"
              element={
                <Layout>
                  <IncidentManagement />
                </Layout>
              }
            />

            {/* Traffic Analytics */}

            <Route
              path="/analytics"
              element={
                <Layout>
                  <TrafficAnalytics />
                </Layout>
              }
            />

            {/* Predictions */}

            <Route
              path="/predictions"
              element={
                <Layout>
                  <Predictions />
                </Layout>
              }
            />

            {/* =========================
                LANE DETECTION
            ========================== */}

            <Route
              path="/lane-detection"
              element={
                <Layout>
                  <LaneDetection />
                </Layout>
              }
            />

            {/* Profile */}

            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />

            {/* =========================
                ADMIN ROUTES
            ========================== */}

            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminDashboard />
                </Layout>
              }
            />

            <Route
              path="/admin/signals"
              element={
                <Layout>
                  <ManageSignals />
                </Layout>
              }
            />

            <Route
              path="/admin/incidents"
              element={
                <Layout>
                  <ManageIncidents />
                </Layout>
              }
            />

          </Route>

          {/* =========================
              DEFAULT ROUTES
          ========================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;