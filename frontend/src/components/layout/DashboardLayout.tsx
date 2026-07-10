import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import type { RootState } from '../../redux/store';

const DashboardLayout: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="min-h-screen flex bg-slate-50 fade-in">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col pt-6 pb-4">
                <div className="px-6 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl leading-none">
                        N
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">NEXA EMR</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{user?.role || 'Staff'}</p>
                    </div>
                </div>

                <nav className="flex-1 w-full px-4 flex flex-col gap-1.5 pt-4">
                    <NavLink to="/" end className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                        Overview
                    </NavLink>
                    <NavLink to="/appointments" className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                        Appointments
                    </NavLink>

                    {user?.role === 'SUPER_ADMIN' && (
                        <>
                            <p className="text-[10px] font-bold text-slate-400 mt-4 mb-2 px-4 uppercase tracking-wider">Administration</p>
                            <NavLink to="/doctors" className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                Manage Doctors
                            </NavLink>
                            <NavLink to="/receptionists" className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                Manage Receptionists
                            </NavLink>
                            <NavLink to="/schedules" className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                Doctor Schedules
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'RECEPTIONIST' && (
                        <>
                            <p className="text-[10px] font-bold text-slate-400 mt-4 mb-2 px-4 uppercase tracking-wider">Front Desk</p>
                            <NavLink to="/patients" className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                Search Patients
                            </NavLink>
                            <NavLink to="/scheduler" className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                Book Appointment
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'DOCTOR' && (
                        <>
                            <p className="text-[10px] font-bold text-slate-400 mt-4 mb-2 px-4 uppercase tracking-wider">My Practice</p>
                            <NavLink to="/mypatients" className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                My Patients
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="mt-auto px-4 w-full">
                    <div className="pt-4 border-t border-slate-100 mb-4 px-2">
                        <p className="text-sm font-semibold text-slate-800">{user?.name || 'Jane Doe'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'jane@nexa.emr'}</p>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary w-full text-sm">
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
