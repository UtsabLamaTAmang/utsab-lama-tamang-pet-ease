import React, { useState, useEffect } from "react";
import { rescueAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Shield, CheckCircle2, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function MyMissions() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            const res = await rescueAPI.getMyMissions();
            setMissions(res.data || []);
        } catch (error) {
            console.error("Failed to fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (missionId) => {
        setCompleting(missionId);
        try {
            await rescueAPI.complete(missionId, { notes: "Rescue completed successfully" });
            toast.success("🎉 Mission completed! Check your badges.");
            fetchMissions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to complete mission");
        } finally {
            setCompleting(null);
        }
    };

    const filtered = filter === "all" ? missions : missions.filter((m) => m.status === filter);

    const statusConfig = {
        ASSIGNED: { color: "bg-blue-100 text-blue-700", label: "Assigned" },
        IN_PROGRESS: { color: "bg-amber-100 text-amber-700", label: "In Progress" },
        RESCUED: { color: "bg-green-100 text-green-700", label: "Completed" },
        CLOSED: { color: "bg-neutral-100 text-neutral-600", label: "Closed" },
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
                <h1 className="text-2xl font-bold text-neutral-900">My Missions</h1>
                <p className="text-sm text-neutral-500 mt-1">Track and manage your rescue missions</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {["all", "IN_PROGRESS", "ASSIGNED", "RESCUED", "CLOSED"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${filter === f
                                ? "bg-primary-600 text-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                    >
                        {f === "all" ? "All" : statusConfig[f]?.label || f}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Shield className="w-10 h-10 text-neutral-300 mb-3" />
                        <p className="text-neutral-500">No missions found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((mission) => {
                        const report = mission.rescueReports?.[0];
                        const status = statusConfig[mission.status] || statusConfig.ASSIGNED;
                        const isActive = mission.status === "IN_PROGRESS" || mission.status === "ASSIGNED";

                        return (
                            <Card key={mission.id} className={`hover:shadow-md transition-shadow ${isActive ? "border-l-4 border-l-amber-400" : ""}`}>
                                <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {report?.petType && (
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                                                        🐾 {report.petType}
                                                    </span>
                                                )}
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                                                    {mission.status === "RESCUED" ? "✅" : "🔄"} {status.label}
                                                </span>
                                            </div>

                                            <p className="text-sm text-neutral-700">{report?.description || "No description"}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                                {report?.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {report.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(mission.createdAt).toLocaleDateString()}
                                                </span>
                                                {report?.reporter?.fullName && (
                                                    <span className="text-xs text-neutral-400">
                                                        Reporter: {report.reporter.fullName}
                                                    </span>
                                                )}
                                            </div>

                                            {mission.notes && (
                                                <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100">
                                                    <FileText className="w-3.5 h-3.5 text-neutral-400 mt-0.5" />
                                                    <p className="text-xs text-neutral-600">{mission.notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        {isActive && (
                                            <Button
                                                onClick={() => handleComplete(mission.id)}
                                                disabled={completing === mission.id}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold min-w-[150px]"
                                            >
                                                {completing === mission.id ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Completing...</>
                                                ) : (
                                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Mark Rescued</>
                                                )}
                                            </Button>
                                        )}
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
