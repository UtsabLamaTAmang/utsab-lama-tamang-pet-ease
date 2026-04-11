import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';
import { format } from 'date-fns';
import { Calendar, Clock, MessageSquare, Star, X, Activity, CheckCircle2, XCircle, AlertCircle, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

/* ─── Status config ─── */
const STATUS = {
    ACTIVE: { label: 'Active', bar: 'from-emerald-500 to-teal-400', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Activity className="w-3 h-3" /> },
    COMPLETED: { label: 'Completed', bar: 'from-indigo-500 to-blue-400', pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <CheckCircle2 className="w-3 h-3" /> },
    CANCELLED: { label: 'Cancelled', bar: 'from-red-400 to-rose-400', pill: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> },
    PENDING_PAYMENT: { label: 'Pending Payment', bar: 'from-amber-400 to-orange-400', pill: 'bg-amber-100 text-amber-700 border-amber-200', icon: <AlertCircle className="w-3 h-3" /> },
    REJECTED: { label: 'Rejected', bar: 'from-neutral-400 to-neutral-300', pill: 'bg-neutral-100 text-neutral-600 border-neutral-200', icon: <XCircle className="w-3 h-3" /> },
};

const TAB_FILTERS = [
    { value: 'ALL', label: 'All' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

/* ─── Doctor Avatar ─── */
function DoctorAvatar({ doctor }) {
    if (doctor.photoUrl) {
        return (
            <img
                src={`http://localhost:5000${doctor.photoUrl}`}
                alt={doctor.user.fullName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-md"
            />
        );
    }
    return (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md ring-2 ring-white">
            {doctor.user.fullName[0]}
        </div>
    );
}

/* ─── Appointment card ─── */
function AppointmentCard({ apt, onRate }) {
    const s = STATUS[apt.status] || STATUS.PENDING_PAYMENT;

    return (
        <div className="relative bg-white rounded-3xl border border-neutral-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden">
            {/* Coloured status bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${s.bar}`} />

            <div className="p-6 flex flex-col gap-5 flex-1">
                {/* Status + duration */}
                <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.pill}`}>
                        {s.icon}
                        {s.label}
                    </span>
                    {apt.duration && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {apt.duration} min
                        </span>
                    )}
                </div>

                {/* Doctor info */}
                <div className="flex items-center gap-4">
                    <DoctorAvatar doctor={apt.doctor} />
                    <div>
                        <p className="font-bold text-neutral-900 text-base leading-tight">{apt.doctor.user.fullName}</p>
                        <p className="text-sm text-indigo-600 font-semibold mt-0.5">{apt.doctor.specialization}</p>
                        {apt.doctor.fee && (
                            <p className="text-xs text-neutral-400 font-medium mt-0.5">Rs. {apt.doctor.fee} / session</p>
                        )}
                    </div>
                </div>

                {/* Date / time chips */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2.5">
                        <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-semibold text-neutral-700 truncate">
                            {apt.appointmentDate
                                ? format(new Date(apt.appointmentDate), 'EEE, MMM d, yyyy')
                                : 'TBD'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2.5">
                        <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-semibold text-neutral-700">
                            {apt.appointmentDate
                                ? format(new Date(apt.appointmentDate), 'h:mm a')
                                : 'TBD'}
                        </span>
                    </div>
                </div>

                {/* Existing rating display */}
                {apt.rating && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= apt.rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}`} />
                        ))}
                        <span className="text-xs font-bold text-amber-700 ml-1">{RATING_LABELS[apt.rating]}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 pt-1">
                    {apt.status === 'ACTIVE' && (
                        <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-2xl h-10 transition-all shadow-sm shadow-emerald-200">
                            <Calendar className="w-4 h-4" />
                            View Details
                        </button>
                    )}

                    {apt.status === 'COMPLETED' && !apt.rating && (
                        <button
                            onClick={() => onRate(apt)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold text-sm rounded-2xl h-10 transition-all shadow-sm shadow-indigo-200"
                        >
                            <Star className="w-4 h-4" />
                            Rate Doctor
                        </button>
                    )}

                    <Link
                        to={apt.chat ? `/user/messages/${apt.chat.id}` : '#'}
                        className={`${(!apt.status === 'ACTIVE' && !apt.rating && apt.status === 'COMPLETED') ? 'flex-1' : ''}`}
                    >
                        <button
                            disabled={!apt.chat}
                            className="flex items-center justify-center gap-2 border border-neutral-200 text-neutral-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 font-semibold text-sm rounded-2xl h-10 px-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed w-full"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Message
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ─── Rating Modal ─── */
function RatingModal({ apt, onClose, onSubmit, submitting }) {
    const [rating, setRating] = useState(5);
    const [hovered, setHovered] = useState(0);
    const [review, setReview] = useState('');

    const displayRating = hovered || rating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* Gradient header */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 px-7 pt-8 pb-10">
                    <div className="absolute -bottom-px left-0 right-0 h-8 bg-white rounded-t-3xl" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="text-center relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-lg">
                            <Star className="w-8 h-8 text-white fill-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Rate Your Experience</h3>
                        <p className="text-sm text-indigo-200 mt-1">
                            How was your session with <span className="font-semibold text-white">Dr. {apt.doctor?.user?.fullName}</span>?
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-7 pb-7 pt-5 space-y-6">

                    {/* Stars */}
                    <div className="text-center space-y-3">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors duration-150 ${star <= displayRating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-neutral-100 text-neutral-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                            <span className="text-sm font-bold text-indigo-700">{RATING_LABELS[displayRating]}</span>
                            <span className="text-xs text-indigo-400">{displayRating}/5</span>
                        </div>
                    </div>

                    {/* Review textarea */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700">
                            Write a Review <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Share your experience with this doctor..."
                            value={review}
                            onChange={e => setReview(e.target.value)}
                            className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 h-11 rounded-2xl border border-neutral-200 text-neutral-600 font-semibold text-sm hover:bg-neutral-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSubmit(rating, review)}
                            disabled={submitting}
                            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                <>
                                    <Star className="w-4 h-4" />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedApt, setSelectedApt] = useState(null);
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => { fetchAppointments(); }, []);

    const fetchAppointments = async () => {
        try {
            const response = await apiClient.get('/doctors/consultations');
            if (response.data.success) setAppointments(response.data.data);
        } catch (err) {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const submitRating = async (rating, review) => {
        if (!selectedApt) return;
        setSubmittingRating(true);
        try {
            const res = await apiClient.patch(
                `/doctors/consultations/${selectedApt.id}/rate`,
                { rating, review }
            );
            if (res.data.success) {
                toast.success('Thank you for your review! 🌟');
                setSelectedApt(null);
                fetchAppointments();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    const filtered = appointments.filter(apt => {
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'UPCOMING') return ['PENDING_PAYMENT', 'ACTIVE'].includes(apt.status);
        return apt.status === statusFilter;
    });

    const counts = {
        ALL: appointments.length,
        UPCOMING: appointments.filter(a => ['PENDING_PAYMENT', 'ACTIVE'].includes(a.status)).length,
        COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
        CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-10">

            {/* ── Hero ── */}
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-8 py-10 sm:px-12 sm:py-12 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-800/40" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-5 backdrop-blur-sm border border-white/10">
                        <Stethoscope className="w-4 h-4 text-indigo-400" />
                        Vet Consultations
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-[1.1] tracking-tight">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Appointments.</span>
                    </h1>
                    <p className="text-base text-neutral-300 leading-relaxed font-medium max-w-xl">
                        Track your consultation history and scheduled visits with our verified veterinary professionals.
                    </p>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: counts.ALL, color: 'text-indigo-600', bg: 'bg-indigo-50  border-indigo-100' },
                    { label: 'Upcoming', value: counts.UPCOMING, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                    { label: 'Completed', value: counts.COMPLETED, color: 'text-blue-600', bg: 'bg-blue-50    border-blue-100' },
                    { label: 'Cancelled', value: counts.CANCELLED, color: 'text-red-500', bg: 'bg-red-50     border-red-100' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} border rounded-2xl p-5 space-y-1 shadow-sm`}>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{s.label}</p>
                        <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Section header + Tabs ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
                        <Stethoscope className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Consultations Overview</h2>
                        <p className="text-neutral-500 font-medium text-sm">Manage your pet's healthcare appointments</p>
                    </div>
                </div>

                {/* Custom tab pills */}
                <div className="flex bg-neutral-100 p-1.5 rounded-2xl shadow-inner gap-1 w-full sm:w-auto">
                    {TAB_FILTERS.map(t => (
                        <button
                            key={t.value}
                            onClick={() => setStatusFilter(t.value)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${statusFilter === t.value
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-neutral-200/60'
                                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50'
                                }`}
                        >
                            {t.label}
                            {counts[t.value] > 0 && (
                                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center ${statusFilter === t.value ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-200 text-neutral-500'
                                    }`}>
                                    {counts[t.value]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-neutral-400 font-medium">Loading your appointments…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100">
                        <Calendar className="w-10 h-10 text-neutral-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-1">No appointments found</h3>
                        <p className="text-neutral-500 max-w-sm mx-auto text-sm">
                            You don't have any {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} consultations yet.
                        </p>
                    </div>
                    <Link to="/user/doctors">
                        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm rounded-2xl px-6 h-11 transition-all shadow-md shadow-indigo-200 mt-2">

                            Book a Consultation
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(apt => (
                        <AppointmentCard
                            key={apt.id}
                            apt={apt}
                            onRate={setSelectedApt}
                        />
                    ))}
                </div>
            )}

            {/* ── Rating Modal ── */}
            {selectedApt && (
                <RatingModal
                    apt={selectedApt}
                    onClose={() => setSelectedApt(null)}
                    onSubmit={submitRating}
                    submitting={submittingRating}
                />
            )}
        </div>
    );
}
