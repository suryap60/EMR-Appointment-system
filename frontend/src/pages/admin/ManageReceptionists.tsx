import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { receptionistService } from '../../services/receptionistService';
import type { User } from '../../types';

const ManageReceptionists: React.FC = () => {
    const [receptionists, setReceptionists] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const loadData = async () => {
        try {
            const data = await receptionistService.getReceptionists();
            setReceptionists(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch receptionists');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await receptionistService.createReceptionist({ name, email, password });
            toast.success("Receptionist account created successfully!");
            setName('');
            setEmail('');
            setPassword('');
            setIsAdding(false);
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create receptionist');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fade-in max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Manage Receptionists</h2>
                    <p className="text-slate-500 mt-1.5">Onboard and view hospital reception staff accounts.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
                        + Add Receptionist
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="card-panel p-6 bg-blue-50/50 border-blue-100 fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">New Receptionist Profile</h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">Close</button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field bg-white w-full text-sm"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Sarah Connor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="input-field bg-white w-full text-sm"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="sarah@hospital.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Temporary Password</label>
                                <input
                                    required
                                    type="password"
                                    className="input-field bg-white w-full text-sm"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[120px]">
                                {isSubmitting ? 'Saving...' : 'Save Receptionist'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card-panel">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="font-semibold py-3 px-5">Sl. No.</th>
                                <th className="font-semibold py-3 px-5">Name</th>
                                <th className="font-semibold py-3 px-5">Email</th>
                                <th className="font-semibold py-3 px-5">Joined</th>
                                <th className="font-semibold py-3 px-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading receptionists...</td></tr>
                            ) : receptionists.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No receptionists found. Add your first one.</td></tr>
                            ) : (
                                receptionists.map((rec, index) => (
                                    <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-5 font-mono text-xs text-slate-500">{index + 1}</td>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                    {rec.name?.charAt(0) || 'R'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{rec.name}</p>
                                                    <p className="text-xs text-slate-500">{rec.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 text-slate-500">{rec.email}</td>
                                        <td className="py-3 px-5 text-slate-500">{new Date(rec.createdAt || '').toLocaleDateString()}</td>
                                        <td className="py-3 px-5 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-600 border-emerald-200">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageReceptionists;
