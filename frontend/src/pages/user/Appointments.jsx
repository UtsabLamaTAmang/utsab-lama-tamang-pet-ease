import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar, Clock, Video, MessageSquare, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/doctors/consultations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100';
            case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100';
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (statusFilter === "ALL") return true;
        if (statusFilter === "UPCOMING") return ['PENDING_PAYMENT', 'ACTIVE'].includes(apt.status);
        return apt.status === statusFilter;
    });

    if (loading) {
        return <div className="p-8 text-center text-neutral-500">Loading appointments...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">My Appointments</h1>
                    <p className="text-neutral-500 mt-1">Track your consultation history and upcoming visits</p>
                </div>

                <Tabs defaultValue="ALL" className="w-full md:w-auto" onValueChange={setStatusFilter}>
                    <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
                        <TabsTrigger value="ALL">All</TabsTrigger>
                        <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
                        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                        <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed text-neutral-500">
                    <div className="bg-neutral-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900">No appointments found</h3>
                    <p className="mb-6">You don't have any appointments in this category.</p>
                    <Link to="/user/doctors">
                        <Button className="font-medium">Book New Consultation</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map((apt) => (
                        <Card key={apt.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow duration-200 border-neutral-200">
                            <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                                {/* Doctor Info */}
                                <div className="flex flex-col items-center md:items-start min-w-[140px] text-center md:text-left">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full mb-3 overflow-hidden border border-slate-200">
                                        {apt.doctor.photoUrl ? (
                                            <img src={`http://localhost:5000${apt.doctor.photoUrl}`} alt={apt.doctor.user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                                                {apt.doctor.user.fullName[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 text-sm">{apt.doctor.user.fullName}</h3>
                                        <p className="text-xs text-neutral-500 font-medium">{apt.doctor.specialization}</p>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant="secondary" className={`font-semibold rounded-md px-2.5 py-0.5 text-xs ${getStatusStyle(apt.status)}`}>
                                            {apt.status.replace('_', ' ')}
                                        </Badge>
                                        {apt.duration && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium">
                                                <Clock className="w-3 h-3" />
                                                {apt.duration} mins
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-neutral-700">
                                            <Calendar className="w-4 h-4 text-neutral-400" />
                                            <span className="font-medium text-sm">
                                                {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMMM do, yyyy') : 'Date TBD'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-500">
                                            <Clock className="w-4 h-4 text-neutral-400" />
                                            <span className="text-sm">
                                                {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'h:mm a') : 'Time TBD'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full md:w-auto flex flex-row md:flex-col gap-2 border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0">
                                    {apt.status === 'ACTIVE' && (
                                        <Button className="w-full md:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9">
                                            <Video className="w-4 h-4" />
                                            Join Call
                                        </Button>
                                    )}

                                    <Link to={apt.chat ? `/user/messages/${apt.chat.id}` : '#'} className="w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            disabled={!apt.chat}
                                            className="w-full gap-2 border-neutral-200 text-neutral-700 h-9 hover:bg-neutral-50 hover:text-neutral-900"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Message
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
