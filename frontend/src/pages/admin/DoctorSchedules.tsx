import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../redux/slices/doctorSlice';
import { doctorService } from '../../services/doctorService';
import type { AppDispatch, RootState } from '../../redux/store';

const DoctorSchedules: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { doctors, loading } = useSelector((state: RootState) => state.doctors);

    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Schedule config state
    const [config, setConfig] = useState({
        slotDurationBase: 15 as number,
        workingDays: [] as string[],
        sessions: [] as { id: number; name: string; start: string; end: string }[],
        breaks: [] as { id: number; name: string; start: string; end: string }[]
    });

    useEffect(() => {
        if (doctors.length === 0) dispatch(fetchDoctors());
    }, [dispatch, doctors.length]);

    useEffect(() => {
        if (selectedDoctorId) {
            const doctor = doctors.find(d => d._id === selectedDoctorId);
            if (doctor) {
                setConfig({
                    slotDurationBase: doctor.slotDuration || 15,
                    workingDays: doctor.workingDays || [],
                    sessions: doctor.sessions?.length ? doctor.sessions.map((s: any, i: number) => ({ id: Date.now() + i, name: `Session ${i + 1}`, start: s.start, end: s.end })) : [
                        { id: Date.now(), name: 'Morning Session', start: '09:00', end: '12:00' }
                    ],
                    breaks: doctor.breaks?.length ? doctor.breaks.map((b: any, i: number) => ({ id: Date.now() + i + 100, name: `Break ${i + 1}`, start: b.start, end: b.end })) : [
                        { id: Date.now() + 100, name: 'Lunch Break', start: '12:00', end: '13:00' }
                    ]
                });
            }
        }
    }, [selectedDoctorId, doctors]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctorId) {
            toast.error("Please select a doctor to configure.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                workingDays: config.workingDays,
                slotDuration: config.slotDurationBase,
                sessions: config.sessions.map(s => ({ start: s.start, end: s.end })),
                breaks: config.breaks.map(b => ({ start: b.start, end: b.end }))
            };

            await doctorService.updateDoctorSchedule(selectedDoctorId, payload);

            // Re-fetch to update redux state
            dispatch(fetchDoctors());

            toast.success("Schedule configuration locked and saved securely.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save schedule");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleWorkingDay = (day: string) => {
        setConfig(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    // Sessions Handlers
    const addSession = () => {
        setConfig(prev => ({
            ...prev,
            sessions: [...prev.sessions, { id: Date.now(), name: `Session ${prev.sessions.length + 1}`, start: '09:00', end: '12:00' }]
        }));
    };

    const updateSession = (id: number, field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const removeSession = (id: number) => {
        setConfig(prev => ({
            ...prev,
            sessions: prev.sessions.filter(s => s.id !== id)
        }));
    };

    // Breaks Handlers
    const addBreak = () => {
        setConfig(prev => ({
            ...prev,
            breaks: [...prev.breaks, { id: Date.now(), name: `Break ${prev.breaks.length + 1}`, start: '12:00', end: '13:00' }]
        }));
    };

    const updateBreak = (id: number, field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            breaks: prev.breaks.map(b => b.id === id ? { ...b, [field]: value } : b)
        }));
    };

    const removeBreak = (id: number) => {
        setConfig(prev => ({
            ...prev,
            breaks: prev.breaks.filter(b => b.id !== id)
        }));
    };

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="max-w-5xl mx-auto space-y-6 fade-in pb-20">
            <header className="border-b border-slate-200 pb-4">
                <h2 className="text-3xl font-bold text-slate-900">Doctor Schedule Management</h2>
                <p className="text-slate-500 mt-1.5">Configure working days, sessions, and automatically generated slots.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Doctor Selection */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 sticky top-6">
                    <h3 className="font-bold text-slate-900">1. Select Professional</h3>
                    <div>
                        <select
                            className="input-field w-full text-sm font-medium"
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                        >
                            <option value="">-- Choose Doctor --</option>
                            {loading ? <option>Loading...</option> : doctors.map(doc => (
                                <option key={doc._id} value={doc._id}>
                                    Dr. {typeof doc.user === 'object' ? doc.user.name : 'Unknown'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedDoctorId && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700 italic">
                                Note: Edits made here will immediately affect dynamic slot generation logic for future dates. Appointments already scheduled will not be moved.
                            </p>
                        </div>
                    )}
                </div>

                {/* Configuration UI */}
                <div className={`lg:col-span-2 space-y-6 ${!selectedDoctorId ? 'opacity-50 pointer-events-none grayscale transition-all' : 'transition-all'}`}>
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Working Days */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Working Days</h3>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleWorkingDay(day)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg border transition ${config.workingDays.includes(day)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Shifts and Durations */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">3. Timings & Flow</h3>

                            {/* Slot Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Generated Slot Duration</label>
                                <div className="flex flex-wrap gap-4">
                                    {[15, 20, 30, 60].map(mins => (
                                        <label key={mins} className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="slotDuration"
                                                className="text-indigo-600 focus:ring-indigo-500"
                                                checked={config.slotDurationBase === mins}
                                                onChange={() => setConfig(prev => ({ ...prev, slotDurationBase: mins }))}
                                            />
                                            {mins} Mins
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sessions */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-slate-700">Active Sessions</label>
                                    <button type="button" onClick={addSession} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">+ Add Session</button>
                                </div>
                                {config.sessions.map((session) => (
                                    <div key={session.id} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                                        <input className="input-field w-full sm:w-1/3 text-sm" value={session.name} onChange={e => updateSession(session.id, 'name', e.target.value)} />
                                        <input type="time" className="input-field w-full sm:w-auto text-sm" value={session.start} onChange={e => updateSession(session.id, 'start', e.target.value)} required />
                                        <span className="text-slate-400 font-medium hidden sm:block">to</span>
                                        <input type="time" className="input-field w-full sm:w-auto text-sm" value={session.end} onChange={e => updateSession(session.id, 'end', e.target.value)} required />
                                        <button type="button" onClick={() => removeSession(session.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2">X</button>
                                    </div>
                                ))}
                                {config.sessions.length === 0 && (
                                    <p className="text-xs text-slate-400">No sessions configured. Doctor will not have any generated slots.</p>
                                )}
                            </div>

                            {/* Breaks */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-slate-700">Scheduled Breaks <span className="text-xs text-rose-500 font-normal ml-2">(Slots will never generate here)</span></label>
                                    <button type="button" onClick={addBreak} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">+ Add Break</button>
                                </div>
                                {config.breaks.map((brk) => (
                                    <div key={brk.id} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                                        <input className="input-field w-full sm:w-1/3 text-sm bg-rose-50/50" value={brk.name} onChange={e => updateBreak(brk.id, 'name', e.target.value)} />
                                        <input type="time" className="input-field w-full sm:w-auto text-sm" value={brk.start} onChange={e => updateBreak(brk.id, 'start', e.target.value)} required />
                                        <span className="text-slate-400 font-medium hidden sm:block">to</span>
                                        <input type="time" className="input-field w-full sm:w-auto text-sm" value={brk.end} onChange={e => updateBreak(brk.id, 'end', e.target.value)} required />
                                        <button type="button" onClick={() => removeBreak(brk.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2">X</button>
                                    </div>
                                ))}
                                {config.breaks.length === 0 && (
                                    <p className="text-xs text-slate-400">No breaks configured.</p>
                                )}
                            </div>
                        </div>

                        {/* Save Action */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSaving || !selectedDoctorId}
                                className="btn-primary w-full md:w-auto md:min-w-[200px]"
                            >
                                {isSaving ? 'Updating Schedule...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedules;
