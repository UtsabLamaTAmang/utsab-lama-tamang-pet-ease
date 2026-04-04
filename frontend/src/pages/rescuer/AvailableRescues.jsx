import React, { useState, useEffect } from "react";
import { rescueAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, AlertTriangle, Phone, Loader2, Shield, User } from "lucide-react";
import toast from "react-hot-toast";

export default function AvailableRescues() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await rescueAPI.getAvailable();
            setReports(res.data || []);
        } catch (error) {
            console.error("Failed to fetch:", error);
            toast.error("Failed to load available rescues");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (reportId) => {
        setAccepting(reportId);
        try {
            await rescueAPI.accept(reportId);
            toast.success("Mission accepted! Head to the rescue location.");
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept mission");
        } finally {
            setAccepting(null);
        }
    };

    const urgencyConfig = {
        LOW: { color: "border-l-blue-400 bg-blue-50/30", badge: "bg-blue-100 text-blue-700" },
        MEDIUM: { color: "border-l-amber-400 bg-amber-50/30", badge: "bg-amber-100 text-amber-700" },
        HIGH: { color: "border-l-orange-400 bg-orange-50/30", badge: "bg-orange-100 text-orange-700" },
        CRITICAL: { color: "border-l-red-400 bg-red-50/30", badge: "bg-red-100 text-red-700" },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Available Rescues</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    {reports.length} pending rescue {reports.length === 1 ? "request" : "requests"} nearby
                </p>
            </div>

            {reports.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Shield className="w-12 h-12 text-green-300 mb-4" />
                        <p className="text-lg font-semibold text-neutral-700">All clear!</p>
                        <p className="text-sm text-neutral-500 mt-1">No pending rescue requests right now. Check back later.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => {
                        const urgency = urgencyConfig[report.urgency] || urgencyConfig.MEDIUM;
                        return (
                            <Card key={report.id} className={`border-l-4 ${urgency.color} hover:shadow-md transition-shadow`}>
                                <CardContent className="p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {report.petType && (
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                                                        🐾 {report.petType}
                                                    </span>
                                                )}
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${urgency.badge}`}>
                                                    {report.urgency === "CRITICAL" ? "🚨" : "⚠️"} {report.urgency}
                                                </span>
                                            </div>

                                            <p className="text-sm text-neutral-700 leading-relaxed">{report.description}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                                                    {report.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(report.createdAt).toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    Reported by {report.reporter?.fullName || "Anonymous"}
                                                </span>
                                                {report.contactNumber && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {report.contactNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleAccept(report.id)}
                                            disabled={accepting === report.id}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 min-w-[140px]"
                                        >
                                            {accepting === report.id ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Accepting...</>
                                            ) : (
                                                <><Shield className="w-4 h-4 mr-2" /> Accept Mission</>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
