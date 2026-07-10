import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../redux/slices/doctorSlice';
import { slotService } from '../services/slotService';
import { appointmentService } from '../services/appointmentService';
import type { AppDispatch, RootState } from '../redux/store';
import type { Doctor } from '../types';

interface SlotData {
    available: { start: string; end: string }[];
    booked: string[];
}

const Scheduler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { doctors, loading: doctorsLoading } = useSelector((state: RootState) => state.doctors);

    // Core selection state
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

    // Slots state
    const [slots, setSlots] = useState<SlotData>({ available: [], booked: [] });
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Booking state
    const [bookingDetails, setBookingDetails] = useState({
        slotTime: '',
        patientType: 'new', // new or existing
        mobileNumber: '',
        name: '',
        patientId: '',
        purpose: ''
    });
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (doctors.length === 0) {
            dispatch(fetchDoctors());
        }
    }, [dispatch, doctors.length]);

    // Setup WebSocket and load slots
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            transports: ['websocket'],
            withCredentials: true
        });

        socket.on('connect', () => console.log('WebSocket Connected!'));

        // When a new appointment is created anywhere, refresh slots if it matches our view
        const handleLiveUpdate = (appointment: any) => {
            if (appointment.doctor === selectedDoctor) {
                // If it falls on the same date, re-fetch the grid to show it as Booked
                const eventDate = dayjs(appointment.date).format('YYYY-MM-DD');
                if (eventDate === selectedDate) {
                    toast('Live Update: Slot was just booked/modified by another user.', { icon: '🔄' });
                    fetchSlots();
                }
            }
        };

        socket.on('appointmentCreated', handleLiveUpdate);
        socket.on('appointmentCancelled', handleLiveUpdate);

        return () => {
            socket.disconnect();
        };
    }, [selectedDoctor, selectedDate]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
            const data = await slotService.getSlots(selectedDoctor, selectedDate);
            setSlots(data);
            setBookingDetails(prev => ({ ...prev, slotTime: '' })); // clear selection
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch slots');
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookingDetails.slotTime) {
            toast.error("Please select a time slot first");
            return;
        }

        setIsBooking(true);
        try {
            // Find end time for the selected start time
            const slotObj = slots.available.find(s => s.start === bookingDetails.slotTime);
            if (!slotObj) throw new Error("Invalid slot selection");

            const payload = {
                doctorId: selectedDoctor,
                date: selectedDate,
                startTime: slotObj.start,
                endTime: slotObj.end,
                purpose: bookingDetails.purpose,
                patientInfo: {
                    mobileNumber: bookingDetails.mobileNumber,
                    name: bookingDetails.name,
                    patientId: bookingDetails.patientId
                }
            };

            await appointmentService.bookAppointment(payload);
            toast.success("Appointment booked successfully!");

            // Clean up and refresh
            setBookingDetails({
                slotTime: '', patientType: 'new', mobileNumber: '', name: '', patientId: '', purpose: ''
            });
            fetchSlots();
        } catch (error: any) {
            // Handling MongoDB 11000 concurrency error cleanly
            if (error.response?.status === 409) {
                toast.error("Concurrency Conflict: This slot was just booked by someone else! Grid updated.", { duration: 5000 });
                fetchSlots(); // Instantly update the board to show it's red
            } else {
                toast.error(error.response?.data?.message || 'Failed to book appointment');
            }
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 fade-in pb-20">
            <header className="border-b border-slate-200 pb-4">
                <h2 className="text-3xl font-bold text-slate-900">Appointment Scheduler</h2>
                <p className="text-slate-500 mt-1.5 flex items-center gap-2">
                    Manage patient bookings and view doctor availability.
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Sync
                    </span>
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Panel: Filters */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 lg:col-span-1 h-fit">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Doctor</label>
                        <select
                            className="input-field w-full"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                        >
                            <option value="">-- Choose Doctor --</option>
                            {doctors.map(doc => (
                                <option key={doc._id} value={doc._id}>
                                    Dr. {typeof doc.user === 'object' ? doc.user.name : 'Unpopulated'} ({doc.department})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Appointment Date</label>
                        <input
                            type="date"
                            min={dayjs().format('YYYY-MM-DD')}
                            className="input-field w-full"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Panel: Slot Grid & Booking Form */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Grid */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[300px]">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Available Slots</h3>

                        {!selectedDoctor ? (
                            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                                Please select a doctor and date to view slots.
                            </div>
                        ) : slotsLoading ? (
                            <div className="h-48 flex items-center justify-center text-blue-500 font-medium animate-pulse">
                                Loading dynamic slots...
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {slots.available.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setBookingDetails(prev => ({ ...prev, slotTime: slot.start }))}
                                        className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-all ${bookingDetails.slotTime === slot.start
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                                            }`}
                                    >
                                        {slot.start} - {slot.end}
                                    </button>
                                ))}

                                {slots.booked.map((timeStr, idx) => (
                                    <div
                                        key={`booked-${idx}`}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border bg-rose-50 border-rose-100 text-rose-400 cursor-not-allowed opacity-50 text-center flex flex-col justify-center line-through"
                                        title="Slot is already booked."
                                    >
                                        {timeStr}
                                    </div>
                                ))}

                                {slots.available.length === 0 && slots.booked.length === 0 && (
                                    <div className="col-span-full h-32 flex items-center justify-center text-slate-400 text-sm">
                                        No working slots generated for this configuration on {selectedDate}.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Booking Form (Only show if a slot is selected) */}
                    {bookingDetails.slotTime && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl text-xs font-bold shadow">
                                Selected: {dayjs(selectedDate).format('MMM D, YYYY')} @ {bookingDetails.slotTime}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-5">Finalize Booking</h3>

                            <form onSubmit={handleBooking} className="space-y-4">
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={bookingDetails.patientType === 'new'}
                                            onChange={() => setBookingDetails(prev => ({ ...prev, patientType: 'new', patientId: '' }))}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        New Patient
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={bookingDetails.patientType === 'existing'}
                                            onChange={() => setBookingDetails(prev => ({ ...prev, patientType: 'existing', name: '' }))}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Existing Patient
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bookingDetails.patientType === 'new' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-1">Full Name *</label>
                                                <input
                                                    required
                                                    className="input-field bg-white w-full"
                                                    value={bookingDetails.name}
                                                    onChange={e => setBookingDetails(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Jane Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-1">Mobile Number *</label>
                                                <input
                                                    required
                                                    className="input-field bg-white w-full"
                                                    value={bookingDetails.mobileNumber}
                                                    onChange={e => setBookingDetails(prev => ({ ...prev, mobileNumber: e.target.value }))}
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-1">Search Patient ID *</label>
                                                <input
                                                    required
                                                    className="input-field bg-white w-full"
                                                    value={bookingDetails.patientId}
                                                    onChange={e => setBookingDetails(prev => ({ ...prev, patientId: e.target.value }))}
                                                    placeholder="PAT-123456"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">Purpose of Visit</label>
                                    <input
                                        className="input-field bg-white w-full"
                                        value={bookingDetails.purpose}
                                        onChange={e => setBookingDetails(prev => ({ ...prev, purpose: e.target.value }))}
                                        placeholder="General Checkup, Follow-up, etc."
                                    />
                                </div>

                                <div className="flex justify-end pt-3">
                                    <button
                                        type="submit"
                                        disabled={isBooking}
                                        className="btn-primary"
                                    >
                                        {isBooking ? 'Processing Lock...' : 'Confirm Appointment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Scheduler;
