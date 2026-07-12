import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import DriverManagement from './pages/DriverManagement';
import TripManagement from './pages/TripManagement';
import Maintenance from './pages/Maintenance';
import FuelExpense from './pages/FuelExpense';
import Expenses from './pages/Expenses';
import AuditLogs from './pages/AuditLogs';
import ReportsAnalytics from './pages/Reports';
import Settings from './pages/Settings';
import Telemetry from './pages/Telemetry';

const ProtectedRoute = ({ isAllowed, children, redirectTo = "/dashboard" }) => {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        setIsAuthenticated(true);
        setUserRole(user.role);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUserRole(user.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Role Permissions according to PDF
  const canManageVehicles = ['Super Admin', 'Fleet Manager'].includes(userRole);
  const canManageDrivers = ['Super Admin', 'Safety Officer'].includes(userRole);
  const canManageTrips = ['Super Admin', 'Driver'].includes(userRole);
  const canManageMaintenance = ['Super Admin', 'Fleet Manager'].includes(userRole);
  const canManageFuel = ['Super Admin', 'Fleet Manager', 'Financial Analyst'].includes(userRole);
  const canManageExpenses = ['Super Admin', 'Financial Analyst'].includes(userRole);
  const canViewReports = ['Super Admin', 'Fleet Manager', 'Financial Analyst'].includes(userRole);
  const canManageSettings = ['Super Admin'].includes(userRole);
  const canViewTelemetry = ['Driver'].includes(userRole);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout onLogout={handleLogout} userRole={userRole} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="telemetry" element={
            <ProtectedRoute isAllowed={canViewTelemetry}>
              <Telemetry />
            </ProtectedRoute>
          } />
          
          <Route path="vehicles" element={
            <ProtectedRoute isAllowed={canManageVehicles}>
              <VehicleRegistry />
            </ProtectedRoute>
          } />
          
          <Route path="drivers" element={
            <ProtectedRoute isAllowed={canManageDrivers}>
              <DriverManagement />
            </ProtectedRoute>
          } />
          
          <Route path="trips" element={
            <ProtectedRoute isAllowed={canManageTrips}>
              <TripManagement />
            </ProtectedRoute>
          } />
          
          <Route path="maintenance" element={
            <ProtectedRoute isAllowed={canManageMaintenance}>
              <Maintenance />
            </ProtectedRoute>
          } />
          
          <Route path="fuel" element={
            <ProtectedRoute isAllowed={canManageFuel}>
              <FuelExpense />
            </ProtectedRoute>
          } />
          
          <Route path="expenses" element={
            <ProtectedRoute isAllowed={canManageExpenses}>
              <Expenses />
            </ProtectedRoute>
          } />
          
          <Route path="reports" element={
            <ProtectedRoute isAllowed={canViewReports}>
              <ReportsAnalytics />
            </ProtectedRoute>
          } />
          
          <Route path="audit-logs" element={
            <ProtectedRoute isAllowed={userRole === 'Super Admin'}>
              <AuditLogs />
            </ProtectedRoute>
          } />

          <Route path="settings" element={
            <ProtectedRoute isAllowed={canManageSettings}>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
