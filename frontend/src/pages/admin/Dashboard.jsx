import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, Package, PawPrint, Ambulance, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

// API setup
const API_BASE_URL = "http://localhost:5000/api";
const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const fetchDashboardStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data.stats;
};

export default function AdminDashboard() {
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['adminStats'],
        queryFn: fetchDashboardStats
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-red-500">
                Failed to load dashboard statistics.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Admin Dashboard</h1>
                <p className="text-neutral-500">Overview of the platform performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Products */}
                <Card className="hover:shadow-md transition-all border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                        <p className="text-xs text-neutral-500">Items in store</p>
                    </CardContent>
                </Card>

                {/* Total Doctors */}
                <Card className="hover:shadow-md transition-all border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Verified Doctors</CardTitle>
                        <Stethoscope className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalDoctors || 0}</div>
                        <p className="text-xs text-neutral-500">
                            {stats?.verifyPendingDoctors > 0
                                ? `${stats.verifyPendingDoctors} pending approval`
                                : 'All verified'}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Pets */}
                <Card className="hover:shadow-md transition-all border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Total Pets</CardTitle>
                        <PawPrint className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalPets || 0}</div>
                        <p className="text-xs text-neutral-500">Registered on platform</p>
                    </CardContent>
                </Card>

                {/* Rescue Missions */}
                <Card className="hover:shadow-md transition-all border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Rescue Missions</CardTitle>
                        <Ambulance className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalRescueMissions || 0}</div>
                        <p className="text-xs text-neutral-500">Total active & completed</p>
                    </CardContent>
                </Card>

                {/* Total Revenue - Extra row */}
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || '0'}</div>
                        <p className="text-xs text-neutral-500">Lifetime earnings</p>
                    </CardContent>
                </Card>

                {/* Total Users - Extra row */}
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-neutral-500">Registered accounts</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
