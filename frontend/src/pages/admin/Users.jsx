import React, { useState, useEffect, useCallback } from "react";
import { adminAPI } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Search, Loader2, ShieldAlert, Shield, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

// Simple debounce hook for search input
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500); // Wait 500ms after typing
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    const [saving, setSaving] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllUsers({
                page,
                limit: 10,
                search: debouncedSearch,
                role: 'RESCUER' // Constrain to rescuers only
            });
            // Handle both older response format and new paginated format gracefully
            if (res.data && res.data.users) {
                setUsers(res.data.users);
                setPagination(res.data.pagination);
            } else {
                setUsers(res.data || []);
                setPagination({ total: (res.data || []).length, totalPages: 1, limit: 10 });
            }
        } catch (error) {
            console.error("Failed to fetch rescuers:", error);
            toast.error("Failed to load rescuers");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const handleRoleChange = async (userId, newRole) => {
        setSaving(userId);
        try {
            await adminAPI.updateUserRole(userId, newRole);
            toast.success(`User role updated to ${newRole}`);

            // If they are no longer a rescuer, remove them from the list
            if (newRole !== 'RESCUER') {
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update role");
        } finally {
            setSaving(null);
        }
    };

    const roleColors = {
        ADMIN: "bg-red-100 text-red-700 border-red-200",
        DOCTOR: "bg-blue-100 text-blue-700 border-blue-200",
        RESCUER: "bg-amber-100 text-amber-700 border-amber-200",
        USER: "bg-neutral-100 text-neutral-700 border-neutral-200",
    };

    const roleIcons = {
        ADMIN: ShieldAlert,
        DOCTOR: Activity,
        RESCUER: Shield,
        USER: Users,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Rescuers Management</h1>
                    <p className="text-sm text-neutral-500 mt-1">Search through {pagination.total} rescuers and manage their roles</p>
                </div>
            </div>

            {/* Search and List */}
            <Card className="border-0 shadow-sm relative overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-neutral-50"
                        />
                    </div>
                </div>

                <div className={`overflow-x-auto min-h-[400px] transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-50/50 border-b border-neutral-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Rescuer Details</th>
                                <th className="px-6 py-4 font-medium">Badges & Points</th>
                                <th className="px-6 py-4 font-medium">Activity</th>
                                <th className="px-6 py-4 font-medium">Join Date</th>
                                <th className="px-6 py-4 font-medium text-right">Account Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {users.map((user) => {
                                const RoleIcon = roleIcons[user.role] || Users;
                                return (
                                    <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase shrink-0">
                                                    {user.fullName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                                                        {user.fullName}
                                                        <RoleIcon className={`w-3.5 h-3.5 ${roleColors[user.role].split(' ')[1]}`} />
                                                    </p>
                                                    <p className="text-neutral-500 text-xs">{user.email}</p>
                                                    {user.phone && <p className="text-neutral-500 text-xs mt-0.5 whitespace-nowrap">{user.phone}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 font-semibold text-amber-600 w-fit">
                                                    <Activity className="w-4 h-4" />
                                                    {user.points || 0} pts
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {(user.userBadges || []).length > 0 ? (
                                                        user.userBadges.map((ub) => (
                                                            <div
                                                                key={ub.id}
                                                                className="w-7 h-7 rounded bg-amber-50 flex items-center justify-center border border-amber-100 text-lg shadow-sm"
                                                                title={ub.badge?.name}
                                                            >
                                                                {ub.badge?.icon || '🏆'}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-neutral-400">No badges</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-row items-center gap-3 text-xs">
                                                <div className="flex flex-col items-center bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100 min-w-[60px]">
                                                    <span className="text-blue-500 font-medium font-xs">Reports</span>
                                                    <strong className="text-blue-700 text-sm mt-0.5">{user._count?.rescueReports || 0}</strong>
                                                </div>
                                                <div className="flex flex-col items-center bg-green-50/50 px-3 py-1.5 rounded-lg border border-green-100 min-w-[60px]">
                                                    <span className="text-green-600 font-medium font-xs">Rescues</span>
                                                    <strong className="text-green-700 text-sm mt-0.5">{user._count?.rescueMissions || 0}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {saving === user.id && (
                                                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                                                )}
                                                <button
                                                    onClick={() => handleStatusToggle(user.id, user.isVerified)}
                                                    disabled={saving === user.id}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider transition-colors border ${user.isVerified
                                                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                                        : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                                                        }`}
                                                >
                                                    {user.isVerified ? "ACTIVE" : "INACTIVE"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {users.length === 0 && !loading && (
                        <div className="text-center py-16">
                            <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 font-medium">No users found</p>
                            {searchTerm && <p className="text-sm text-neutral-400">Try a different search term</p>}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-white">
                        <p className="text-sm text-neutral-500">
                            Showing <span className="font-medium text-neutral-900">{(page - 1) * pagination.limit + 1}</span> to{" "}
                            <span className="font-medium text-neutral-900">{Math.min(page * pagination.limit, pagination.total)}</span> of{" "}
                            <span className="font-medium text-neutral-900">{pagination.total}</span> users
                        </p>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="p-1.5 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center px-3 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-md bg-neutral-50">
                                Page {page} of {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages || loading}
                                className="p-1.5 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-x-0 top-0 h-1">
                        <div className="h-full bg-primary-600 animate-[pulse_1s_ease-in-out_infinite] w-1/3"></div>
                    </div>
                )}
            </Card>
        </div>
    );
}
