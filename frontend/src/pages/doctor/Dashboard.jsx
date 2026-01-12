import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Star, Clock } from "lucide-react";

export default function DoctorDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Doctor Dashboard</h1>
                <p className="text-neutral-500">Manage your appointments and patients.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                        <Calendar className="h-4 w-4 text-primary-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-neutral-500">2 pending confirmation</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-secondary-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-neutral-500">Across 3 specializations</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8</div>
                        <p className="text-xs text-neutral-500">Based on 56 reviews</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2:30 PM</div>
                        <p className="text-xs text-neutral-500">with Fluffy (Dog)</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all cursor-pointer bg-indigo-50 border-indigo-100" onClick={() => window.location.href = '/doctor/schedule'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900">Availability</CardTitle>
                        <Clock className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-indigo-700">Manage Schedule</div>
                        <p className="text-xs text-indigo-500">Set your working hours</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
