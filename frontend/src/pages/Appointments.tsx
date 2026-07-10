import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../redux/slices/doctorSlice';
import { appointmentService } from '../services/appointmentService';
import type { AppDispatch, RootState } from '../redux/store';

const Appointments: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { doctors } = useSelector((state: RootState) => state.doctors);

    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filters, setFilters] = useState({
        doctorId: '',
        status: '',
        patientName: '',
        date: ''
    });

    useEffect(() => {
        if (doctors.length === 0) dispatch(fetchDoctors());
    }, [dispatch, doctors.length]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            // Build query params dynamically
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '10');
            if (filters.doctorId) params.append('doctorId', filters.doctorId);
            if (filters.status) params.append('status', filters.status);
            if (filters.patientName) params.append('patientName', filters.patientName);
            if (filters.date) {
                params.append('startDate', filters.date);
                params.append('endDate', filters.date);
            }

            const res = await appointmentService.getAppointments(params);
            setAppointments(res.data);

            const totalDocs = res.meta?.total || 0;
            const limit = res.meta?.limit || 10;
            setTotalPages(Math.ceil(totalDocs / limit) || 1);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search slightly
        const timer = setTimeout(() => {
            loadAppointments();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, page]);

    const handleArrive = async (id: string) => {
        try {
            await appointmentService.markArrived(id);
            toast.success("Patient marked as arrived");
            loadAppointments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await appointmentService.cancelAppointment(id);
            toast.success("Appointment cancelled");
            loadAppointments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Appointments Hub</h2>
                    <p className="text-slate-500 mt-1.5">View, filter, and manage all scheduled patient visits.</p>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Search Patient</label>
                    <input
                        type="text"
                        className="input-field text-sm w-full py-2"
                        placeholder="Name or Phone..."
                        value={filters.patientName}
                        onChange={(e) => { setFilters(prev => ({ ...prev, patientName: e.target.value })); setPage(1); }}
                    />
                </div>
                <div className="w-[180px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Doctor</label>
                    <select
                        className="input-field text-sm w-full py-2"
                        value={filters.doctorId}
                        onChange={(e) => { setFilters(prev => ({ ...prev, doctorId: e.target.value })); setPage(1); }}
                    >
                        <option value="">All Doctors</option>
                        {doctors.map(d => (
                            <option key={d._id} value={d._id}>Dr. {typeof d.user === 'object' ? d.user.name : 'Unknown'}</option>
                        ))}
                    </select>
                </div>
                <div className="w-[160px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                    <input
                        type="date"
                        className="input-field text-sm w-full py-2"
                        value={filters.date}
                        onChange={(e) => { setFilters(prev => ({ ...prev, date: e.target.value })); setPage(1); }}
                    />
                </div>
                <div className="w-[140px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                    <select
                        className="input-field text-sm w-full py-2"
                        value={filters.status}
                        onChange={(e) => { setFilters(prev => ({ ...prev, status: e.target.value })); setPage(1); }}
                    >
                        <option value="">All</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <button
                        onClick={() => { setFilters({ doctorId: '', status: '', patientName: '', date: '' }); setPage(1); }}
                        className="btn-secondary h-[42px] px-4 text-sm"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="font-semibold py-3 px-5">Date & Time</th>
                                <th className="font-semibold py-3 px-5">Patient</th>
                                <th className="font-semibold py-3 px-5">Doctor</th>
                                <th className="font-semibold py-3 px-5">Purpose</th>
                                <th className="font-semibold py-3 px-5">Status</th>
                                <th className="font-semibold py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && appointments.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-500">Loading appointments...</td></tr>
                            ) : appointments.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-500">No appointments found matching your filters.</td></tr>
                            ) : (
                                appointments.map((apt) => (
                                    <tr key={apt._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-5">
                                            <div className="font-semibold text-slate-800">{dayjs(apt.date).format('MMM D, YYYY')}</div>
                                            <div className="text-xs text-indigo-600 font-bold">{apt.startTime} - {apt.endTime}</div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="font-medium text-slate-800">{apt.patient?.name}</div>
                                            <div className="text-xs text-slate-500">{apt.patient?.mobileNumber}</div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="font-medium text-slate-700">
                                                Dr. {apt.doctor?.user?.name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-slate-500">{apt.department}</div>
                                        </td>
                                        <td className="py-3 px-5 text-slate-600 max-w-[200px] truncate" title={apt.purpose}>
                                            {apt.purpose || '-'}
                                        </td>
                                        <td className="py-3 px-5">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${apt.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                apt.status === 'Arrived' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        'bg-rose-50 text-rose-600 border-rose-200'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5 text-right font-medium flex justify-end gap-2">
                                            {apt.status === 'Scheduled' && (
                                                <button onClick={() => handleArrive(apt._id)} className="px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded text-xs transition">
                                                    Mark Arrive
                                                </button>
                                            )}
                                            {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                                                <button onClick={() => handleCancel(apt._id)} className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 rounded text-xs transition">
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                        <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 bg-white border border-slate-300 rounded text-sm hover:bg-slate-100 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 bg-white border border-slate-300 rounded text-sm hover:bg-slate-100 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
