import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { fetchDoctors, createDoctor } from '../../redux/slices/doctorSlice';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const ManageDoctors: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { doctors, loading } = useSelector((state: RootState) => state.doctors);
    const [isAdding, setIsAdding] = useState(false);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        if (doctors.length === 0) {
            dispatch(fetchDoctors());
        }
    }, [dispatch, doctors.length]);

    const onSubmit = async (data: any) => {
        try {
            // Split qualifications by comma
            data.qualifications = data.qualifications.split(',').map((q: string) => q.trim());
            data.experience = parseInt(data.experience, 10);
            data.consultationFee = parseFloat(data.consultationFee);

            await dispatch(createDoctor(data)).unwrap();
            toast.success('Doctor created successfully');
            setIsAdding(false);
            reset();
        } catch (error: any) {
            toast.error(error || 'Failed to create doctor');
        }
    };

    return (
        <div className="fade-in max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Manage Doctors</h2>
                    <p className="text-slate-500 mt-1.5">View and onboard medical professionals</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
                        + Add Doctor
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="card-panel p-6 bg-blue-50/50 border-blue-100 fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">New Doctor Profile</h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">Close</button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                <input {...register('name', { required: true })} className="input-field bg-white" placeholder="Dr. John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                <input type="email" {...register('email', { required: true })} className="input-field bg-white" placeholder="doctor@clinic.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                                <input type="password" {...register('password', { required: true })} className="input-field bg-white" placeholder="Initial password" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                                <input {...register('department', { required: true })} className="input-field bg-white" placeholder="Cardiology" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Specialization</label>
                                <input {...register('specialization', { required: true })} className="input-field bg-white" placeholder="Interventional Cardiology" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Experience (Years)</label>
                                <input type="number" {...register('experience', { required: true })} className="input-field bg-white" placeholder="10" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
                                <input type="number" step="0.01" {...register('consultationFee', { required: true })} className="input-field bg-white" placeholder="150" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Qualifications</label>
                                <input {...register('qualifications', { required: true })} className="input-field bg-white" placeholder="MBBS, MD (Comma separated)" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[120px]">
                                {isSubmitting ? 'Saving...' : 'Save Doctor'}
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
                                <th className="font-semibold py-3 px-5">Doctor Name</th>
                                <th className="font-semibold py-3 px-5">Department</th>
                                <th className="font-semibold py-3 px-5">Experience</th>
                                <th className="font-semibold py-3 px-5">Fee</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading doctors...</td></tr>
                            ) : doctors.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No doctors onboarded yet.</td></tr>
                            ) : (
                                doctors.map((doc, index) => (
                                    <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-5 font-mono text-xs text-slate-500">{index + 1}</td>
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                                    {(doc.user as any)?.name?.charAt(0) || 'D'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{(doc.user as any)?.name}</p>
                                                    <p className="text-xs text-slate-500">{(doc.user as any)?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5">
                                            <p className="font-medium text-slate-700">{doc.department}</p>
                                            <p className="text-xs text-slate-500">{doc.specialization || 'General'}</p>
                                        </td>
                                        <td className="py-3 px-5 text-slate-700 font-medium">{doc.experience || 0} Years</td>
                                        <td className="py-3 px-5 text-slate-700 font-medium">${doc.consultationFee || 0}</td>
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

export default ManageDoctors;
