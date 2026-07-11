import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './redux/store';
import DashboardLayout from './components/layout/DashboardLayout';
import { SocketProvider } from './components/providers/SocketProvider';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import ManageDoctors from './pages/admin/ManageDoctors';

import Scheduler from './pages/Scheduler';

import DoctorSchedules from './pages/admin/DoctorSchedules';
import ManageReceptionists from './pages/admin/ManageReceptionists';
import Patients from './pages/Patients';
import MyPatients from './pages/MyPatients';

import { socketAppointmentCreated, socketAppointmentUpdated, socketAppointmentCancelled } from './redux/slices/appointmentSlice';
import { useSocket } from './hooks/useSocket';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GlobalSocketListener = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();

  React.useEffect(() => {
    if (!socket || !isConnected) return;

    const handleCreate = (data: any) => dispatch(socketAppointmentCreated(data));
    const handleUpdate = (data: any) => dispatch(socketAppointmentUpdated(data));
    const handleCancel = (data: any) => dispatch(socketAppointmentCancelled(data));

    socket.on('appointmentCreated', handleCreate);
    socket.on('appointmentUpdated', handleUpdate);
    socket.on('appointmentCancelled', handleCancel);

    return () => {
      socket.off('appointmentCreated', handleCreate);
      socket.off('appointmentUpdated', handleUpdate);
      socket.off('appointmentCancelled', handleCancel);
    };
  }, [socket, isConnected, dispatch]);

  return null;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <GlobalSocketListener />
              <DashboardLayout />
            </SocketProvider>
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
        <Route path="patients" element={<Patients />} />
        <Route path="scheduler" element={<Scheduler />} />

        {/* Doctor Routes */}
        <Route path="mypatients" element={<MyPatients />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
