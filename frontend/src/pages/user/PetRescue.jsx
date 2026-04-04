import React, { useState, useEffect } from "react";
import { rescueAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertTriangle, MapPin, Phone, Send, Clock, CheckCircle2, XCircle,
    Loader2, Crosshair, Navigation
} from "lucide-react";
import toast from "react-hot-toast";

export default function PetRescue() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [locating, setLocating] = useState(false);
    const [form, setForm] = useState({
        petType: "",
        location: "",
        description: "",
        urgency: "MEDIUM",
        contactNumber: "",
        images: [],
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await rescueAPI.getMyReports();
            setReports(res.data || []);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ petType: "", location: "", description: "", urgency: "MEDIUM", contactNumber: "", images: [] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.location || !form.description) {
            toast.error("Location and description are required");
            return;
        }
        setSubmitting(true);
        try {
            await rescueAPI.report(form);
            toast.success("Rescue report submitted! Rescuers will be notified.");
            resetForm();
            setOpen(false);
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit report");
        } finally {
            setSubmitting(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse geocode using free Nominatim API
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
                    );
                    const data = await res.json();
                    const address = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                    setForm((prev) => ({ ...prev, location: address }));
                    toast.success("Location detected!");
                } catch {
                    setForm((prev) => ({ ...prev, location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
                    toast.success("Coordinates set");
                }
                setLocating(false);
            },
            (error) => {
                setLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error("Location permission denied. Please allow location access.");
                } else {
                    toast.error("Unable to get your location");
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const urgencyColors = {
        LOW: "bg-blue-100 text-blue-700 border-blue-200",
        MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
        HIGH: "bg-orange-100 text-orange-700 border-orange-200",
        CRITICAL: "bg-red-100 text-red-700 border-red-200",
    };

    const statusConfig = {
        PENDING: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Awaiting Rescuer" },
        IN_PROGRESS: { color: "bg-blue-100 text-blue-700", icon: Loader2, label: "Rescue In Progress" },
        RESOLVED: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Rescued!" },
        REJECTED: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 px-4 py-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-8 py-10 sm:px-12 sm:py-12 shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-800/50"></div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6 backdrop-blur-md border border-white/10">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            Emergency Response
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-[1.1] tracking-tight">
                            Report a Pet in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Distress.</span>
                        </h1>
                        <p className="text-base text-neutral-300 leading-relaxed font-medium max-w-xl">
                            Rapid response saves lives. Alert our network of volunteer rescuers to an animal in urgent need of help.
                        </p>
                    </div>

                    <div className="shrink-0 md:pl-8">
                        <Button
                            onClick={() => setOpen(true)}
                            size="lg"
                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 rounded-2xl px-8 h-16 w-full sm:w-auto"
                        >
                            <AlertTriangle className="w-5 h-5 mr-3 animate-pulse" />
                            Report Emergency
                        </Button>
                    </div>
                </div>
            </div>

            {/* ===== REPORT MODAL ===== */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-5 h-5" />
                            Report a Rescue
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the details about the animal in distress. A rescuer will respond as soon as possible.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {/* Pet Type */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Pet Type</Label>
                            <Input
                                placeholder="e.g. Dog, Cat, Bird..."
                                value={form.petType}
                                onChange={(e) => setForm({ ...form, petType: e.target.value })}
                            />
                        </div>

                        {/* Urgency */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Urgency Level</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: "LOW", label: "Low", desc: "Safe but needs help" },
                                    { value: "MEDIUM", label: "Medium", desc: "Needs attention soon" },
                                    { value: "HIGH", label: "High", desc: "In danger" },
                                    { value: "CRITICAL", label: "Critical", desc: "Immediate rescue!" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, urgency: opt.value })}
                                        className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${form.urgency === opt.value
                                            ? `${urgencyColors[opt.value]} border-current ring-1 ring-current/20`
                                            : "border-neutral-200 bg-white hover:border-neutral-300"
                                            }`}
                                    >
                                        <span className="text-sm font-semibold">
                                            {opt.label}
                                        </span>
                                        <p className="text-[11px] opacity-70 mt-0.5">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Location *</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        placeholder="Street, landmark, or area..."
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={getCurrentLocation}
                                    disabled={locating}
                                    className="shrink-0 border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-800 cursor-pointer"
                                >
                                    {locating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Navigation className="w-4 h-4" />
                                    )}
                                    <span className="ml-1.5 hidden sm:inline text-xs font-medium">
                                        {locating ? "Locating..." : "Current"}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Description *</Label>
                            <textarea
                                placeholder="Describe the animal's condition, color, size, and what help is needed..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                required
                            />
                        </div>

                        {/* Contact */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Contact Number (optional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="+977 98XXXXXXXX"
                                    value={form.contactNumber}
                                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { resetForm(); setOpen(false); }}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 font-semibold"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                                ) : (
                                    <><Send className="w-4 h-4 mr-2" /> Submit Report</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ===== MY REPORTS ===== */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                    <div className="p-3 bg-red-100 rounded-2xl shadow-sm border border-red-200/50">
                        <Crosshair className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">My Active Reports</h2>
                        <p className="text-neutral-500 font-medium text-sm">Track the status of animals you've reported</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-neutral-50 border border-neutral-200/60 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-neutral-100">
                            <AlertTriangle className="w-10 h-10 text-neutral-300" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-3">No rescue reports yet</h3>
                        <p className="text-neutral-500 max-w-sm mb-8 text-lg">You haven't reported any animals in distress. Click the emergency button above if you spot one.</p>
                        <Button
                            onClick={() => setOpen(true)}
                            variant="outline"
                            className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl px-6 h-12 font-semibold shadow-sm"
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" /> Report an Emergency
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {reports.map((report) => {
                            const status = statusConfig[report.status] || statusConfig.PENDING;
                            const StatusIcon = status.icon;
                            return (
                                <div key={report.id} className="relative bg-white rounded-3xl shadow-sm border border-neutral-200/60 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                                    <div className={`h-2 w-full ${report.status === "RESOLVED" ? "bg-green-500" :
                                        report.status === "IN_PROGRESS" ? "bg-blue-500" :
                                            report.status === "REJECTED" ? "bg-red-500" : "bg-amber-500"
                                        }`}></div>

                                    <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10 space-y-5">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            {report.petType && (
                                                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100/50">
                                                    {report.petType}
                                                </span>
                                            )}
                                            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border text-white ${report.urgency === 'CRITICAL' ? 'bg-red-600 border-red-700' : report.urgency === 'HIGH' ? 'bg-orange-500 border-orange-600' : report.urgency === 'MEDIUM' ? 'bg-amber-500 border-amber-600' : 'bg-blue-500 border-blue-600'}`}>
                                                {report.urgency}
                                            </span>
                                            <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${status.color} border border-current/20`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {status.label}
                                            </span>
                                        </div>

                                        <p className="text-neutral-600 text-[15px] leading-relaxed line-clamp-4 flex-1">"{report.description}"</p>

                                        <div className="space-y-3 pt-5 border-t border-neutral-100 mt-auto">
                                            <div className="flex items-center text-sm text-neutral-600 bg-neutral-50/80 px-4 py-3 rounded-xl border border-neutral-100/50">
                                                <MapPin className="w-4 h-4 mr-3 text-neutral-400 shrink-0" />
                                                <span className="font-medium text-neutral-800 tracking-tight truncate">{report.location}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-neutral-600 bg-neutral-50/80 px-4 py-3 rounded-xl border border-neutral-100/50">
                                                <Clock className="w-4 h-4 mr-3 text-neutral-400 shrink-0" />
                                                <span className="font-medium text-neutral-800 tracking-tight">
                                                    {new Date(report.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        {report.mission && (
                                            <div className="mt-4 px-4 py-3 rounded-xl bg-blue-50/80 border border-blue-100/50 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                    {report.mission.rescuer?.fullName?.charAt(0) || "R"}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-blue-600/80 font-bold uppercase tracking-wider mb-0.5">Assigned Rescuer</p>
                                                    <p className="text-sm font-bold text-blue-900">
                                                        {report.mission.rescuer?.fullName || "Awaiting Volunteer"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
