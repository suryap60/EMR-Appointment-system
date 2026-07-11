import React, { useEffect, useState } from 'react';
import { patientService } from '../services/patientService';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const MyPatients: React.FC = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const res = await patientService.getMyPatients({ search, page });
            setPatients(res.data);
            setTotalPages(Math.ceil(res.meta.total / res.meta.limit) || 1);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch your patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadPatients();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">My Patients</h2>
                    <p className="text-slate-500 mt-1.5">View and search through all patients who have booked appointments with you.</p>
                </div>
            </header>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Search Patient Name, Email or Mobile...</label>
                    <input
                        type="text"
                        className="input-field text-sm w-full py-2"
                        placeholder="Search query..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="font-semibold py-3 px-5">Sl. No.</th>
                                <th className="font-semibold py-3 px-5">Patient Details</th>
                                <th className="font-semibold py-3 px-5">Mobile</th>
                                <th className="font-semibold py-3 px-5">Registered Since</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-slate-400">Loading your patients...</td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-slate-400">No patients found.</td>
                                </tr>
                            ) : (
                                patients.map((pt, index) => (
                                    <tr key={pt._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-5 font-mono text-xs text-slate-500">{index + 1 + (page - 1) * 10}</td>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                    {pt.name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{pt.name}</p>
                                                    <p className="text-xs text-slate-500">ID: {pt.patientId} {pt.email ? `• ${pt.email}` : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 text-slate-700 font-medium">{pt.mobileNumber}</td>
                                        <td className="py-3 px-5 text-slate-700 font-medium">{dayjs(pt.createdAt).format('MMM D, YYYY')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                        <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-white border border-slate-300 rounded text-sm hover:bg-slate-100 disabled:opacity-50">Previous</button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-white border border-slate-300 rounded text-sm hover:bg-slate-100 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default MyPatients;
