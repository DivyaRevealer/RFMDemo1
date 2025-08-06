import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Create_Campaign from "./components/Create_Campaign";
import Run_Campaign from "./components/Run_Campaign";
import Layout from "./components/Layout";

const isAuthenticated = () => !!localStorage.getItem("token");
const PrivateRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public login page */}
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Protected Create Campaign page */}
        <Route
          path="/create-campaign"
          element={
            <PrivateRoute>
              <Layout>
                <Create_Campaign />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Protected Run Campaign page */}
        <Route
          path="/run-campaign"
          element={
            <PrivateRoute>
              <Layout>
                <Run_Campaign />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Catch-all routes redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
