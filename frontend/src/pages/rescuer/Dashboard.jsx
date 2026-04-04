import React, { useState, useEffect } from "react";
import { rescueAPI } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle2, Clock, Award, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RescuerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, badgeCount: 0 });
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, missionsRes] = await Promise.all([
                rescueAPI.getStats(),
                rescueAPI.getMyMissions(),
            ]);
            setStats(statsRes.data || {});
            setMissions((missionsRes.data || []).slice(0, 5));
        } catch (error) {
            console.error("Failed to load dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "Total Missions", value: stats.total, icon: Shield, color: "from-blue-500 to-blue-600" },
        { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "from-green-500 to-green-600" },
        { label: "In Progress", value: stats.inProgress, icon: Clock, color: "from-amber-500 to-amber-600" },
        { label: "Badges Earned", value: stats.badgeCount, icon: Award, color: "from-purple-500 to-purple-600" },
    ];

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
                <h1 className="text-2xl font-bold text-neutral-900">Rescuer Dashboard</h1>
                <p className="text-sm text-neutral-500 mt-1">Your rescue mission overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="border-0 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                                        <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-green-100 bg-green-50/30"
                    onClick={() => navigate("/rescuer/available")}
                >
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-semibold text-neutral-900">Available Rescues</p>
                                <p className="text-xs text-neutral-500">Browse and accept new missions</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-neutral-400" />
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-purple-100 bg-purple-50/30"
                    onClick={() => navigate("/rescuer/badges")}
                >
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-purple-600" />
                            <div>
                                <p className="font-semibold text-neutral-900">My Badges</p>
                                <p className="text-xs text-neutral-500">View your achievement collection</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-neutral-400" />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Missions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-800">Recent Missions</h2>
                    <button
                        onClick={() => navigate("/rescuer/missions")}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                    >
                        View all →
                    </button>
                </div>
                {missions.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-10 text-center">
                            <Shield className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500">No missions yet. Check available rescues!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {missions.map((mission) => {
                            const report = mission.rescueReports?.[0];
                            return (
                                <Card key={mission.id} className="hover:shadow-sm transition-shadow">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-neutral-800">
                                                {report?.petType || "Animal"} rescue — {report?.location || "Unknown"}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {new Date(mission.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${mission.status === "RESCUED"
                                                ? "bg-green-100 text-green-700"
                                                : mission.status === "IN_PROGRESS"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-neutral-100 text-neutral-600"
                                            }`}>
                                            {mission.status}
                                        </span>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
