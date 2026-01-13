import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingBag, Calendar, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddPetModal from "@/components/pet/AddPetModal";

export default function UserDashboard() {
    const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Dashboard</h1>
                <p className="text-neutral-500">Welcome back! Here's what's happening with your pets.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-all border-primary-100 bg-primary-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary-900">My Pets</CardTitle>
                        <Heart className="h-4 w-4 text-primary-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary-700">2</div>
                        <p className="text-xs text-primary-600/80">Active profiles</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Vet Visits</CardTitle>
                        <Calendar className="h-4 w-4 text-secondary-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-neutral-500">Tomorrow at 10:00 AM</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Shipped</div>
                        <p className="text-xs text-neutral-500">Order #12345</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Adoption Status</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Pending</div>
                        <p className="text-xs text-neutral-500">Application under review</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">Quick Actions</h2>
            <div className="flex gap-4">
                <Button className="bg-primary-600 hover:bg-primary-700">Find a Vet</Button>
                <Button variant="outline">Shop Supplies</Button>
                <Button variant="outline" onClick={() => setIsAddPetModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Donate a Pet
                </Button>
            </div>

            <AddPetModal
                isOpen={isAddPetModalOpen}
                onClose={() => setIsAddPetModalOpen(false)}
            />
        </div>
    );
}
