import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, KeyRound } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (response.message) {
                toast.success(response.message || "Password updated successfully");
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error("Password update error:", error);
            const errMsg = error.response?.data?.message || "Failed to update password";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Account Settings</h1>
                <p className="text-neutral-500">Manage your account security and preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Overview (Optional display) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Your current account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-neutral-500">Full Name</Label>
                                <p className="font-medium text-neutral-900">{user?.fullName}</p>
                            </div>
                            <div>
                                <Label className="text-neutral-500">Email Address</Label>
                                <p className="font-medium text-neutral-900">{user?.email}</p>
                            </div>
                            <div>
                                <Label className="text-neutral-500">Account Type</Label>
                                <p className="font-medium text-primary-600 uppercase">{user?.role}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="border-amber-100">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-amber-500" />
                            <CardTitle>Change Password</CardTitle>
                        </div>
                        <CardDescription>Update your password to keep your account secure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Must be at least 6 characters"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your new password"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 mt-4"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
