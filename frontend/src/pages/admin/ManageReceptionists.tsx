import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { receptionistService } from '../../services/receptionistService';
import type { User } from '../../types';

const ManageReceptionists: React.FC = () => {
    const [receptionists, setReceptionists] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

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
        setIsCreating(true);
        try {
            await receptionistService.createReceptionist({ name, email, password });
            toast.success("Receptionist account created successfully!");
            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            // Reload list
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create receptionist');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 fade-in pb-20">
            <header className="border-b border-slate-200 pb-4">
                <h2 className="text-3xl font-bold text-slate-900">Manage Receptionists</h2>
                <p className="text-slate-500 mt-1.5">Onboard and view hospital reception staff accounts.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Create Form */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Add New Receptionist</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                className="input-field w-full text-sm"
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
                                className="input-field w-full text-sm"
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
                                className="input-field w-full text-sm"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="btn-primary w-full mt-2"
                        >
                            {isCreating ? 'Creating Profile...' : 'Create Receptionist'}
                        </button>
                    </form>
                </div>

                {/* List View */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="font-semibold py-3 px-5">Name</th>
                                    <th className="font-semibold py-3 px-5">Email</th>
                                    <th className="font-semibold py-3 px-5">Joined</th>
                                    <th className="font-semibold py-3 px-5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-12 text-center text-slate-500">Loading receptionists...</td></tr>
                                ) : receptionists.length === 0 ? (
                                    <tr><td colSpan={4} className="py-12 text-center text-slate-500">No receptionists found. Add your first one.</td></tr>
                                ) : (
                                    receptionists.map((rec) => (
                                        <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-5 font-bold text-slate-800">{rec.name}</td>
                                            <td className="py-3 px-5 text-slate-500">{rec.email}</td>
                                            <td className="py-3 px-5 text-slate-500">{new Date(rec.createdAt || '').toLocaleDateString()}</td>
                                            <td className="py-3 px-5 text-center">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-600 border-emerald-200">
                                                    Active Role
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
        </div>
    );
};

export default ManageReceptionists;
