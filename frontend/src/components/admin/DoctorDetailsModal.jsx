import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Mail,
    Phone,
    MapPin,
    FileText,
    Ban,
    Check,
    X,
    GraduationCap,
    Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";
const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function DoctorDetailsModal({ doctor, open, onOpenChange, onDoctorUpdated }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [confirmation, setConfirmation] = useState({
        open: false,
        title: "",
        description: "",
        action: () => { },
        label: "Continue",
        variant: "default"
    });

    if (!doctor) return null;

    const { user } = doctor;
    const baseURL = "http://localhost:5000";

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setSelectedImage(null);
            onOpenChange(val);
        }}>
            <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 border-none shadow-2xl flex flex-col bg-white">

                {/* 1. Verified / Status Banner (Optional top strip) */}
                <div className={`h-2 w-full ${doctor.verificationStatus === 'APPROVED' ? 'bg-green-500' :
                    doctor.verificationStatus === 'PENDING' ? 'bg-amber-500' :
                        doctor.verificationStatus === 'REJECTED' ? 'bg-red-500' : 'bg-neutral-500'
                    }`} />

                {/* 2. Premium Header with Gradient Profile Cover feel */}
                <div className="relative bg-neutral-50 px-8 pt-8 pb-6 border-b border-neutral-100">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar - Slightly larger and elevated */}
                        <div className="relative -mt-2">
                            <Avatar className="w-24 h-24 border-4 border-white shadow-lg ring-1 ring-neutral-100">
                                <AvatarImage
                                    src={doctor.photoUrl ? `${baseURL}${doctor.photoUrl}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                                    alt={user.fullName}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-3xl bg-primary-100 text-primary-700 font-semibold">
                                    {user.fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2">
                                {doctor.verificationStatus === 'APPROVED' && (
                                    <div className="bg-green-500 text-white p-1.5 rounded-full ring-2 ring-white shadow-sm" title="Verified Doctor">
                                        <Check className="w-4 h-4" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Quick Info */}
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <DialogTitle className="text-3xl font-bold text-neutral-900 tracking-tight">
                                        {user.fullName}
                                    </DialogTitle>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <Badge variant="secondary" className="bg-primary-50 text-priority-700 hover:bg-primary-100 border-primary-200">
                                            {doctor.specialization}
                                        </Badge>
                                        <span className="text-neutral-300">•</span>
                                        <span className="text-neutral-600 font-medium">{doctor.experienceYears} Years Exp.</span>
                                    </div>
                                </div>

                                {/* Status Chip */}
                                <div className="flex-shrink-0">
                                    {doctor.verificationStatus === 'PENDING' && (
                                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-200">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            Awaiting Approval
                                        </div>
                                    )}
                                    {doctor.verificationStatus === 'REJECTED' && (
                                        <Badge variant="destructive">Rejected</Badge>
                                    )}
                                    {doctor.verificationStatus === 'DISABLED' && (
                                        <Badge variant="outline" className="text-neutral-500">Deactivated</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Modern Content Tabs */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white">
                    <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-8 border-b border-neutral-100 sticky top-0 bg-white z-10">
                            <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                                <TabTriggerItem value="details" label="Profile & Details" />
                                <TabTriggerItem value="qualifications" label="Qualifications" />
                                <TabTriggerItem value="documents" label="Documents" />
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-neutral-50/30">
                            {/* TAB: PROFILE & DETAILS */}
                            <TabsContent value="details" className="mt-0 space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Grid Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left Column: Quick Contact Panel */}
                                    <div className="space-y-6">
                                        <SectionCard title="Contact Information">
                                            <ContactItem icon={Mail} label="Email" value={user.email} />
                                            <ContactItem icon={Phone} label="Phone" value={user.phone} />
                                            <ContactItem icon={MapPin} label="Address" value={doctor.clinicAddress} />
                                        </SectionCard>

                                        <SectionCard title="Consultation">
                                            <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                                <span className="text-sm font-medium text-neutral-500">Fee per visit</span>
                                                <span className="text-xl font-bold text-neutral-900">${doctor.fee}</span>
                                            </div>
                                        </SectionCard>
                                    </div>

                                    {/* Right Column: Bio & Availability */}
                                    <div className="md:col-span-2 space-y-6">
                                        <SectionCard title="About Doctor">
                                            <p className="text-neutral-600 leading-relaxed whitespace-pre-line text-sm">
                                                {doctor.bio || "No biography has been provided by the doctor."}
                                            </p>
                                        </SectionCard>

                                        <SectionCard title="Availability Schedule">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 text-center">
                                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">Days</span>
                                                    <span className="font-semibold text-neutral-900">{doctor.availableDays || "N/A"}</span>
                                                </div>
                                                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 text-center">
                                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">Hours</span>
                                                    <span className="font-semibold text-neutral-900">{doctor.availableHours || "N/A"}</span>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: QUALIFICATIONS */}
                            <TabsContent value="qualifications" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <StatCard icon={Briefcase} label="Experience" value={`${doctor.experienceYears} Years`} subtext="Professional Practice" />
                                    <StatCard icon={GraduationCap} label="Qualification" value={doctor.qualification} subtext="Primary Degree" />
                                    <StatCard icon={FileText} label="License Number" value={doctor.licenseNumber} subtext="Medical License ID" fullWidth />
                                </div>
                            </TabsContent>

                            {/* TAB: DOCUMENTS */}
                            <TabsContent value="documents" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <DocumentPreview
                                        title="Medical License"
                                        url={doctor.licenseDocUrl}
                                        baseURL={baseURL}
                                        onView={() => doctor.licenseDocUrl && setSelectedImage(`${baseURL}${doctor.licenseDocUrl}`)}
                                    />
                                    <DocumentPreview
                                        title="Degree Certificate"
                                        url={doctor.degreeDocUrl}
                                        baseURL={baseURL}
                                        onView={() => doctor.degreeDocUrl && setSelectedImage(`${baseURL}${doctor.degreeDocUrl}`)}
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* 4. Action Footer */}
                <div className="bg-white p-5 border-t border-neutral-100 flex justify-between items-center z-10 flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="text-neutral-500 hover:text-neutral-900">
                        Cancel
                    </Button>

                    <div className="flex gap-3">
                        {doctor.verificationStatus === 'APPROVED' && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setConfirmation({
                                        open: true,
                                        title: "Deactivate Doctor Account?",
                                        description: "This will revoke their access to the application immediately. Are you sure you want to proceed?",
                                        label: "Deactivate",
                                        variant: "destructive",
                                        action: () => {
                                            api.put(`/doctors/admin/deactivate/${doctor.id}`)
                                                .then(() => { onDoctorUpdated && onDoctorUpdated(); onOpenChange(false); })
                                                .catch(() => alert("Failed to deactivate")); // Keeping basic alert for error as requested change was for CONFIRMATIONS
                                        }
                                    });
                                }}
                                className="gap-2 shadow-sm"
                            >
                                <Ban className="w-4 h-4" /> Deactivate Account
                            </Button>
                        )}

                        {(doctor.verificationStatus !== 'APPROVED') && (
                            <Button
                                className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200"
                                onClick={() => {
                                    const action = doctor.verificationStatus === 'PENDING' ? 'approve' : 'reactivate';
                                    setConfirmation({
                                        open: true,
                                        title: `${action === 'approve' ? 'Approve' : 'Reactivate'} Doctor?`,
                                        description: `Are you sure you want to ${action} Dr. ${user.fullName}? They will gain access to the platform.`,
                                        label: action === 'approve' ? 'Approve & Verify' : 'Reactivate',
                                        variant: "default",
                                        action: () => {
                                            api.put(`/doctors/admin/reactivate/${doctor.id}`)
                                                .then(() => { onDoctorUpdated && onDoctorUpdated(); onOpenChange(false); })
                                                .catch(() => alert("Failed to update status"));
                                        }
                                    });
                                }}
                            >
                                <Check className="w-4 h-4" />
                                {doctor.verificationStatus === 'PENDING' ? 'Approve & Verify' : 'Reactivate'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Lightbox for Documents */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center">
                            <img src={selectedImage} alt="Document" className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl" />
                            <Button
                                size="icon"
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Confirmation Alert Dialog */}
                <AlertDialog open={confirmation.open} onOpenChange={(open) => !open && setConfirmation(prev => ({ ...prev, open: false }))}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
                            <AlertDialogDescription>{confirmation.description}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    confirmation.action();
                                    setConfirmation(prev => ({ ...prev, open: false }));
                                }}
                                className={confirmation.variant === "destructive" ? "bg-red-600 hover:bg-red-700 focus:ring-red-600" : ""}
                            >
                                {confirmation.label}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </DialogContent>
        </Dialog>
    );
}

// --- Subcomponents for Cleaner Code ---

const TabTriggerItem = ({ value, label }) => (
    <TabsTrigger
        value={value}
        className="data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-700 data-[state=active]:shadow-none bg-transparent rounded-none h-full px-1 pb-3 text-sm font-medium text-neutral-500 transition-none hover:text-neutral-800"
    >
        {label}
    </TabsTrigger>
);

const SectionCard = ({ title, children }) => (
    <div className="bg-white p-5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 border-b border-neutral-50 pb-2">
            {title}
        </h4>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const ContactItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 group">
        <div className="p-2 rounded-lg bg-neutral-50 text-neutral-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-colors">
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-medium text-neutral-900 break-words">{value || "N/A"}</p>
        </div>
    </div>
);

const StatCard = ({ icon: Icon, label, value, subtext, fullWidth }) => (
    <div className={`bg-white p-6 rounded-xl border border-neutral-100 shadow-sm flex items-center gap-5 ${fullWidth ? 'md:col-span-2' : ''}`}>
        <div className="p-3 rounded-full bg-primary-50 text-primary-600">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
            {subtext && <p className="text-xs text-neutral-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const DocumentPreview = ({ title, url, baseURL, onView }) => {
    if (!url) return (
        <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-neutral-400 bg-neutral-50/50">
            <FileText className="w-10 h-10 mb-3 opacity-30" />
            <span className="text-sm font-medium">No {title} Uploaded</span>
        </div>
    );
    return (
        <div onClick={onView} className="group cursor-pointer relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-lg transition-all hover:border-primary-200">
            <div className="h-40 bg-neutral-100 relative">
                <img src={`${baseURL}${url}`} alt={title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur text-neutral-900 px-4 py-2 rounded-full text-sm font-medium shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                        View Document
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white border-t border-neutral-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-semibold text-neutral-900">{title}</h5>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3" /> Uploaded & Ready
                        </p>
                    </div>
                    <FileText className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 transition-colors" />
                </div>
            </div>
        </div>
    );
};
