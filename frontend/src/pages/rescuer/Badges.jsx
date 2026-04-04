import React, { useState, useEffect } from "react";
import { rescueAPI } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Loader2, Lock, CheckCircle2 } from "lucide-react";

export default function Badges() {
    const [badgeData, setBadgeData] = useState({ badges: [], totalRescues: 0, earnedCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const res = await rescueAPI.getBadges();
            setBadgeData(res.data || { badges: [], totalRescues: 0, earnedCount: 0 });
        } catch (error) {
            console.error("Failed to fetch badges:", error);
        } finally {
            setLoading(false);
        }
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
                <h1 className="text-2xl font-bold text-neutral-900">Badges</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    {badgeData.earnedCount} of {badgeData.badges.length} badges earned · {badgeData.totalRescues} total rescues
                </p>
            </div>

            {/* Progress */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Award className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-neutral-900">
                                {badgeData.totalRescues} Rescue{badgeData.totalRescues !== 1 ? "s" : ""} Completed
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {badgeData.badges.length - badgeData.earnedCount > 0
                                    ? `${badgeData.badges.length - badgeData.earnedCount} more badges to unlock`
                                    : "All badges earned! You're a champion! 🏆"}
                            </p>
                            <div className="mt-2 w-full h-2 bg-white/60 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${badgeData.badges.length > 0 ? (badgeData.earnedCount / badgeData.badges.length) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgeData.badges.map((badge) => (
                    <Card
                        key={badge.id}
                        className={`transition-all duration-300 ${badge.earned
                                ? "border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 shadow-md"
                                : "opacity-60 grayscale"
                            }`}
                    >
                        <CardContent className="p-6 text-center space-y-3">
                            <div className="text-5xl">{badge.icon}</div>
                            <div>
                                <p className="font-bold text-neutral-900">{badge.name}</p>
                                <p className="text-xs text-neutral-500 mt-1">{badge.description}</p>
                            </div>
                            <div className="flex items-center justify-center gap-1.5">
                                {badge.earned ? (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Earned {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : ""}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                                        <Lock className="w-3.5 h-3.5" />
                                        {badge.threshold} rescues needed
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {badgeData.badges.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <Award className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500">No badges available yet. Contact an admin to seed badge data.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
