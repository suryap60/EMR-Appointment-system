import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../redux/store';
import dayjs from 'dayjs';
import { appointmentService } from '../services/appointmentService';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        try {
            // Fetch today's appointments
            const today = dayjs().format('YYYY-MM-DD');
            const params = new URLSearchParams();
            params.append('startDate', today);
            params.append('endDate', today);
            params.append('limit', '50'); // Pull top 50 today

            const res = await appointmentService.getAppointments(params);
            setAppointments(res.data || []);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const lastSocketEvent = useSelector((state: RootState) => state.appointments?.lastIncomingEvent);

    useEffect(() => {
        if (!lastSocketEvent) return;

        setAppointments(prev => {
            const { eventType, payload } = lastSocketEvent;

            // Only care about today's appointments for dashboard
            const isToday = dayjs(payload.date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');

            if (eventType === 'CREATED' && isToday) {
                return [...prev, payload];
            }
            if (eventType === 'UPDATED') {
                return prev.map(a => a._id === payload._id ? payload : a);
            }
            if (eventType === 'CANCELLED') {
                return prev.filter(a => a._id !== payload._id);
            }

            return prev;
        });

    }, [lastSocketEvent]);

    const todayCount = appointments.length;
    const pendingCount = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Arrived').length;
    const completedCount = appointments.filter(a => a.status === 'Completed').length;

    // Sort upcoming (Scheduled/Arrived) primarily by time
    const upcomingList = appointments
        .filter(a => a.status !== 'Cancelled' && a.status !== 'Completed')
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 10);

    return (
        <div className="fade-in max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-blue-700 bg-blue-100 border border-blue-200">
                            {user?.role.replace('_', ' ')}
                        </span>
                        <p className="text-slate-500 font-medium">{dayjs().format('dddd, MMMM D, YYYY')}</p>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0] || 'Doc'}!
                    </h2>
                    <p className="text-slate-500 mt-2 max-w-xl line-clamp-2">
                        {user?.role === 'DOCTOR' ? "Here is a quick overview of your schedule and patient flow for today." : "Here is a quick overview of today's operational metrics and upcoming appointments."}
                    </p>
                </div>
                {user?.role !== 'SUPER_ADMIN' && (
                    <Link to="/appointments" className="btn-primary relative z-10 flex items-center gap-2 shadow-lg shadow-blue-500/30 w-fit">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Manage Appointments
                    </Link>
                )}
            </header>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-slate-100 group-hover:text-blue-50 transition-colors">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2z" /></svg>
                    </div>
                    <p className="text-slate-500 font-semibold text-sm mb-2 uppercase tracking-wide relative z-10">Total Today</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <h3 className="text-5xl font-extrabold text-slate-900">{loading ? '-' : todayCount}</h3>
                        <span className="text-sm font-medium text-slate-400">Appointments</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-slate-100 group-hover:text-amber-50 transition-colors">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    </div>
                    <p className="text-amber-600 font-semibold text-sm mb-2 uppercase tracking-wide relative z-10">Pending / Waiting</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <h3 className="text-5xl font-extrabold text-amber-500">{loading ? '-' : pendingCount}</h3>
                        <span className="text-sm font-medium text-amber-600/70">Patients</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-slate-100 group-hover:text-emerald-50 transition-colors">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    </div>
                    <p className="text-emerald-600 font-semibold text-sm mb-2 uppercase tracking-wide relative z-10">Completed</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <h3 className="text-5xl font-extrabold text-emerald-500">{loading ? '-' : completedCount}</h3>
                        <span className="text-sm font-medium text-emerald-600/70">Served</span>
                    </div>
                </div>
            </section>

            {/* Upcoming List */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-extrabold text-slate-900">Immediate Schedule</h3>
                    <Link to="/appointments" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">View All &rarr;</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="font-semibold py-4 px-6 text-xs uppercase tracking-wider">Sl. No.</th>
                                <th className="font-semibold py-4 px-6 text-xs uppercase tracking-wider">Patient Name</th>
                                <th className="font-semibold py-4 px-6 text-xs uppercase tracking-wider">Time</th>
                                <th className="font-semibold py-4 px-6 text-xs uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium animate-pulse">Loading schedule...</td>
                                </tr>
                            ) : upcomingList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">No pending appointments for today!</td>
                                </tr>
                            ) : (
                                upcomingList.map((apt, index) => (
                                    <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6 font-mono text-sm text-slate-500">{index + 1}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-inner">
                                                    {apt.patient?.name?.substring(0, 2).toUpperCase() || 'NA'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{apt.patient?.name || 'Unknown'}</p>
                                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {apt.patient?.mobileNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span className="text-slate-700 font-bold">{apt.startTime}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${apt.status === 'Arrived'
                                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                : 'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>
                                                {apt.status === 'Arrived' ? (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Arrived</>
                                                ) : (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span> Scheduled</>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
