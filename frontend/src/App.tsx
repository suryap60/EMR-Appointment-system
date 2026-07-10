import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './redux/store';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import PlaceholderPage from './pages/PlaceholderPage';
import Login from './pages/Login';
import ManageDoctors from './pages/admin/ManageDoctors';

import Scheduler from './pages/Scheduler';

import DoctorSchedules from './pages/admin/DoctorSchedules';
import ManageReceptionists from './pages/admin/ManageReceptionists';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        {/* Admin Routes */}
        <Route path="doctors" element={<ManageDoctors />} />
        <Route path="receptionists" element={<ManageReceptionists />} />
        <Route path="schedules" element={<DoctorSchedules />} />

        {/* Receptionist Routes */}
        <Route path="patients" element={<PlaceholderPage />} />
        <Route path="scheduler" element={<Scheduler />} />

        {/* Doctor Routes */}
        <Route path="mypatients" element={<PlaceholderPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
