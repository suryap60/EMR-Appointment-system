import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const stats = { today: 12, pending: 4, completed: 8 };

    return (
        <div className="fade-in max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                        Welcome back, {user?.name?.split(' ')[0] || 'Dr. Smith'}
                    </h2>
                    <p className="text-slate-500 mt-1.5">{dayjs().format('dddd, MMMM D, YYYY')}</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Book Appointment
                </button>
            </header>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-panel p-6 flex flex-col justify-center">
                    <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wide">Today's Appointments</p>
                    <div className="flex items-center gap-3">
                        <h3 className="text-4xl font-extrabold text-slate-900">{stats.today}</h3>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg> 2.1%</span>
                    </div>
                </div>
                <div className="card-panel p-6 flex flex-col justify-center">
                    <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wide">Pending Arrival</p>
                    <h3 className="text-4xl font-extrabold text-blue-600">{stats.pending}</h3>
                </div>
                <div className="card-panel p-6 flex flex-col justify-center">
                    <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wide">Completed Today</p>
                    <h3 className="text-4xl font-extrabold text-slate-900">{stats.completed}</h3>
                </div>
            </section>

            {/* Upcoming List */}
            <section className="card-panel">
                <div className="p-5 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Upcoming Appointments</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="font-semibold py-3 px-5">Patient Name</th>
                                <th className="font-semibold py-3 px-5">Time</th>
                                <th className="font-semibold py-3 px-5">Status</th>
                                <th className="font-semibold py-3 px-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">JD</div>
                                        <div>
                                            <p className="font-semibold text-slate-800">John Doe</p>
                                            <p className="text-xs text-slate-500">ID: PT-10293</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-5 text-slate-700 font-medium">09:00 AM</td>
                                <td className="py-3 px-5">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        Scheduled
                                    </span>
                                </td>
                                <td className="py-3 px-5 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Mark Arrived</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">AS</div>
                                        <div>
                                            <p className="font-semibold text-slate-800">Alice Smith</p>
                                            <p className="text-xs text-slate-500">ID: PT-10294</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-5 text-slate-700 font-medium">10:15 AM</td>
                                <td className="py-3 px-5">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Arrived
                                    </span>
                                </td>
                                <td className="py-3 px-5 text-right">
                                    <button className="text-slate-500 hover:text-slate-700 font-medium transition-colors">View Details</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
