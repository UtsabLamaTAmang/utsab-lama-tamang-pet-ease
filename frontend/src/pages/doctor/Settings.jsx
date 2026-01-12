import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { SimpleCalendar } from "@/components/ui/SimpleCalendar";
import { format } from 'date-fns';

export default function DoctorSettings() {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        specialization: '',
        experienceYears: '',
        fee: '',
        bio: '',
        clinicAddress: '',
        available: true,
        availableDays: [],
        availableHours: { start: '09:00', end: '17:00' },
        leaveDays: []
    });

    // Days of week
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/doctors/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const data = response.data.data;
                setProfile({
                    specialization: data.specialization || '',
                    experienceYears: data.experienceYears || '',
                    fee: data.fee || '',
                    bio: data.bio || '',
                    clinicAddress: data.clinicAddress || '',
                    available: data.available,
                    availableDays: data.availableDays ? JSON.parse(data.availableDays) : [],
                    availableHours: data.availableHours ? JSON.parse(data.availableHours) : { start: '09:00', end: '17:00' },
                    leaveDays: data.leaveDays || []
                });
            }
        } catch (error) {
            console.error("Fetch profile error:", error);
            toast.error("Failed to load profile");
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/doctors/profile', {
                ...profile,
                availableDays: JSON.stringify(profile.availableDays),
                availableHours: JSON.stringify(profile.availableHours)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (day) => {
        if (profile.availableDays.includes(day)) {
            setProfile({ ...profile, availableDays: profile.availableDays.filter(d => d !== day) });
        } else {
            setProfile({ ...profile, availableDays: [...profile.availableDays, day] });
        }
    };

    const toggleLeaveDay = (date) => {
        // Date from SimpleCalendar is a Date object? Or string?
        // SimpleCalendar returns Date object onSelect.
        // We need to store YYYY-MM-DD string.
        const dateStr = format(date, 'yyyy-MM-dd');

        if (profile.leaveDays.includes(dateStr)) {
            setProfile({ ...profile, leaveDays: profile.leaveDays.filter(d => d !== dateStr) });
        } else {
            setProfile({ ...profile, leaveDays: [...profile.leaveDays, dateStr] });
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
            <p className="text-neutral-500 mb-8">Manage your profile, availability, and emergency leave.</p>

            <div className="grid gap-8">
                {/* Availability Section */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-primary">Availability</h2>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <Label>Working Days</Label>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                {days.map(day => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={day}
                                            checked={profile.availableDays.includes(day)}
                                            onCheckedChange={() => toggleDay(day)}
                                        />
                                        <label htmlFor={day} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {day}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Working Hours</Label>
                            <div className="flex items-center gap-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-neutral-500">Start Time</span>
                                    <Input
                                        type="time"
                                        value={profile.availableHours.start}
                                        onChange={(e) => setProfile({ ...profile, availableHours: { ...profile.availableHours, start: e.target.value } })}
                                    />
                                </div>
                                <span className="pt-5">-</span>
                                <div className="space-y-1">
                                    <span className="text-xs text-neutral-500">End Time</span>
                                    <Input
                                        type="time"
                                        value={profile.availableHours.end}
                                        onChange={(e) => setProfile({ ...profile, availableHours: { ...profile.availableHours, end: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Leave Section */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-red-500">Emergency Leave</h2>
                    <p className="text-sm text-neutral-500 mb-4">Select dates you are unavailable. Existing bookings on these dates may need manual cancellation.</p>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div>
                            <SimpleCalendar
                                onSelect={toggleLeaveDay}
                                className="border-red-100"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-sm mb-2">Selected Leave Dates:</h3>
                            {profile.leaveDays.length === 0 ? (
                                <p className="text-neutral-400 text-sm italic">No dates selected.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.leaveDays.sort().map(date => (
                                        <div key={date} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-red-100">
                                            <span>{format(new Date(date), "MMM do, yyyy")}</span>
                                            <button onClick={() => toggleLeaveDay(new Date(date))} className="hover:text-red-800">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* General Info */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-primary">General Info</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label>Consultation Fee</Label>
                            <Input
                                type="number"
                                value={profile.fee}
                                onChange={(e) => setProfile({ ...profile, fee: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Clinic Address</Label>
                            <Input
                                value={profile.clinicAddress}
                                onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleUpdate} disabled={loading} size="lg">
                        {loading ? "Saving Changes..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
