import React, { useState, useEffect } from 'react';
import { doctorAPI, chatAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar as CalendarIcon,
    Clock,
    FileText,
    CheckCircle,
    MessageSquare,
    Search,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';


export default function DoctorAppointments() {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: null,
        confirmText: 'Confirm',
        variant: 'default'
    });
    const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

    // Filter State
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();

    const fetchConsultations = async () => {
        try {
            setLoading(true);
            const response = await doctorAPI.getConsultations(statusFilter, dateFilter, searchQuery);
            if (response.success) {
                setConsultations(response.data);
            }
        } catch (error) {
            console.error("Error fetching consultations:", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchConsultations();
        }, 300);
        return () => clearTimeout(debounce);
    }, [statusFilter, dateFilter, searchQuery]);

    const handleChat = async (consultation) => {
        try {
            if (consultation.chat && consultation.chat.id) {
                navigate(`/doctor/messages/${consultation.chat.id}`);
            } else {
                toast.error("Chat not available");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to open chat");
        }
    };

    const handleCancelAppointment = (consultation) => {
        setConfirmDialog({
            isOpen: true,
            title: "Cancel Appointment",
            description: "Are you sure you want to cancel this appointment? This action cannot be undone.",
            confirmText: "Cancel Appointment",
            variant: "destructive",
            onConfirm: async () => {
                try {
                    const response = await doctorAPI.updateStatus(consultation.id, "CANCELLED");
                    if (response.success) {
                        toast.success("Appointment cancelled");
                        fetchConsultations();
                        closeConfirm();
                    } else {
                        toast.error(response.message || "Failed to cancel");
                        closeConfirm();
                    }
                } catch (error) {
                    console.error("Error cancelling appointment:", error);
                    toast.error("An error occurred");
                    closeConfirm();
                }
            }
        });
    };

    const handleCompleteAppointment = (consultation) => {
        setConfirmDialog({
            isOpen: true,
            title: "Complete Appointment",
            description: "Are you sure you want to mark this appointment as completed?",
            confirmText: "Mark Completed",
            variant: "default",
            onConfirm: async () => {
                try {
                    const response = await doctorAPI.updateStatus(consultation.id, "COMPLETED");
                    if (response.success) {
                        toast.success("Appointment marked as completed");
                        fetchConsultations();
                        closeConfirm();
                    } else {
                        toast.error(response.message || "Failed to complete");
                        closeConfirm();
                    }
                } catch (error) {
                    console.error("Error completing appointment:", error);
                    toast.error("An error occurred");
                    closeConfirm();
                }
            }
        });
    };

    const handleConfirmPayment = (consultation) => {
        setConfirmDialog({
            isOpen: true,
            title: "Confirm Manual Payment",
            description: "Confirm that cash payment has been received and you want to start the consultation?",
            confirmText: "Confirm Payment",
            variant: "default",
            onConfirm: async () => {
                try {
                    const response = await doctorAPI.updateStatus(consultation.id, "ACTIVE");
                    if (response.success) {
                        toast.success("Payment confirmed, consultation is now active");
                        fetchConsultations();
                        closeConfirm();
                    } else {
                        toast.error(response.message || "Failed to confirm payment");
                        closeConfirm();
                    }
                } catch (error) {
                    console.error("Error confirming payment:", error);
                    toast.error("An error occurred");
                    closeConfirm();
                }
            }
        });
    };

    if (loading && !consultations.length) {
        return <div className="p-8 text-center">Loading appointments...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">Appointments</h1>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sticky top-0 bg-neutral-50 p-4 z-10 rounded-xl shadow-sm border border-neutral-100">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input
                        placeholder="Search patient name..."
                        className="pl-10 bg-white w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white">
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6">
                {consultations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                        <p className="text-neutral-500">No appointments found matching your filters.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {consultations.map((consultation) => (
                            <AppointmentCard
                                key={consultation.id}
                                consultation={consultation}
                                onChat={() => handleChat(consultation)}
                                onCancel={() => handleCancelAppointment(consultation)}
                                onComplete={() => handleCompleteAppointment(consultation)}
                                onConfirmPayment={() => handleConfirmPayment(consultation)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            <Dialog open={confirmDialog.isOpen} onOpenChange={closeConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmDialog.title}</DialogTitle>
                        <DialogDescription>{confirmDialog.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={closeConfirm}>Cancel</Button>
                        <Button
                            variant={confirmDialog.variant}
                            onClick={confirmDialog.onConfirm}
                        >
                            {confirmDialog.confirmText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AppointmentCard({ consultation, onChat, onCancel, onComplete, onConfirmPayment }) {
    const statusColors = {
        PENDING_PAYMENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
        ACTIVE: "bg-green-100 text-green-800 border-green-200",
        COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
        CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };

    const hasPrescription = consultation.prescriptions?.length > 0;

    return (
        <Card className="overflow-hidden border-neutral-200 hover:shadow-md transition-shadow flex flex-col h-full">
            <CardContent className="p-6 flex-grow">
                {/* Header: Avatar + Name + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                            {consultation.user?.imageUrl ? (
                                <img src={consultation.user.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="font-bold text-primary-700 text-lg">
                                    {consultation.user?.fullName?.charAt(0) || "P"}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-900 leading-none mb-2">{consultation.user?.fullName || "Guest User"}</h3>
                            <Badge variant="outline" className={`${statusColors[consultation.status]} border`}>
                                {consultation.status.replace("_", " ")}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-neutral-400 shrink-0" />
                        <span className="truncate">{format(new Date(consultation.appointmentDate), "MMM do, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-neutral-400 shrink-0" />
                        <span className="truncate">{format(new Date(consultation.appointmentDate), "h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 text-neutral-500">
                        <span className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] shrink-0 font-bold">30</span>
                        <span>30 mins Duration</span>
                    </div>
                </div>

                {/* Pet */}
                {consultation.pet && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                        <span className="font-medium text-neutral-900">Patient Pet:</span>
                        <Badge variant="secondary" className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700">
                            {consultation.pet.name}
                        </Badge>
                    </div>
                )}

                {/* Prescription Status (completed only) */}
                {consultation.status === 'COMPLETED' && (
                    <div className="mt-4 flex items-center gap-2">
                        <FileText size={14} className={hasPrescription ? "text-teal-600" : "text-neutral-400"} />
                        <span className={`text-xs font-semibold ${hasPrescription ? "text-teal-700" : "text-neutral-400"}`}>
                            {hasPrescription ? "Prescription Issued" : "No Prescription"}
                        </span>
                        {hasPrescription && (
                            <span className="ml-auto text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2 py-0.5 font-medium">
                                {consultation.prescriptions.length} Rx
                            </span>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Footer Actions */}
            <div className="bg-white border-t border-neutral-100 p-4 flex flex-wrap items-center justify-end gap-2 shrink-0">
                {/* Chat */}
                {consultation.status !== 'CANCELLED' && (
                    <Button variant="outline" size="sm" className="gap-2 shrink-0 flex-1 sm:flex-none" onClick={onChat}>
                        <MessageSquare size={16} /> Chat
                    </Button>
                )}

                {/* Mark Complete */}
                {consultation.status === 'ACTIVE' && (
                    <Button size="sm" variant="outline" className="gap-2 shrink-0 flex-1 sm:flex-none bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 hover:text-green-800" onClick={onComplete}>
                        <CheckCircle size={16} /> Mark Completed
                    </Button>
                )}

                {/* Pending Payment actions */}
                {consultation.status === 'PENDING_PAYMENT' && (
                    <>
                        <Button size="sm" variant="destructive" className="gap-2 shrink-0 flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:text-red-700" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button size="sm" className="gap-2 shrink-0 flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white border-transparent" onClick={onConfirmPayment}>
                            <CheckCircle size={16} /> Confirm Manual Payment
                        </Button>
                    </>
                )}
            </div>
        </Card>
    );
}
