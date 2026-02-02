import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Filter, Stethoscope } from "lucide-react";
import BookingModal from "./BookingModal";

// API fetch function
const fetchDoctors = async ({ queryKey }) => {
    const [_, params] = queryKey;
    const { search, specialization, page } = params;
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (specialization && specialization !== "ALL") queryParams.append('specialization', specialization);
    queryParams.append('status', 'APPROVED'); // Only show approved doctors
    queryParams.append('page', page);

    const response = await axios.get(`http://localhost:5000/api/doctors?${queryParams.toString()}`);
    return response.data;
};

export default function FindDoctors() {
    const [search, setSearch] = useState("");
    const [specialization, setSpecialization] = useState("ALL");
    const [location, setLocation] = useState("");
    const [page, setPage] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['doctors', { search, specialization, location, page }],
        queryFn: fetchDoctors,
        keepPreviousData: true
    });

    const doctors = responseData?.data || [];

    const handleBookClick = (doctor) => {
        setSelectedDoctor(doctor);
        setIsBookingOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Find a Vet</h1>
                    <p className="text-neutral-500">Connect with top-rated veterinary professionals.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-52">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Name or keyword..."
                            className="pl-9 bg-white rounded-full border-neutral-200 focus-visible:ring-primary-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Location */}
                    <div className="relative w-full sm:w-52">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Location..."
                            className="pl-9 bg-white rounded-full border-neutral-200 focus-visible:ring-primary-500"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    {/* Specialization Select */}
                    <div className="relative w-full sm:w-52">
                        <select
                            className="w-full h-10 bg-white border border-neutral-200 rounded-full px-4 text-xs sm:text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer hover:border-primary-400 transition-colors"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                        >
                            <option value="ALL">All Specialists</option>
                            <option value="General Checkup">General Checkup</option>
                            <option value="Emergency / Critical">Emergency / Critical</option>
                            <option value="Skin & Allergy">Skin & Allergy</option>
                            <option value="Surgery">Surgery</option>
                            <option value="Dental Care">Dental Care</option>
                            <option value="Vaccination">Vaccination</option>
                            <option value="Nutrition & Diet">Nutrition & Diet</option>
                            <option value="Behavior & Training">Behavior & Training</option>
                            <option value="Eye & Ear Problems">Eye & Ear Problems</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none">
                            <Filter className="w-4 h-4 text-neutral-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.length > 0 ? doctors.map((doctor) => (
                        <div key={doctor.id} className="group bg-white rounded-2xl border border-neutral-100 p-6 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 overflow-hidden relative">
                                        {doctor.photoUrl ? (
                                            <img src={`http://localhost:5000${doctor.photoUrl}`} alt={doctor.user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold">{doctor.user.fullName?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-neutral-900 leading-tight mb-1">{doctor.user.fullName}</h3>
                                        <Badge variant="secondary" className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-0 font-medium">
                                            {doctor.specialization}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-700 text-sm font-bold">
                                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                        {doctor.averageRating || 'New'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-neutral-600 gap-2">
                                    <Stethoscope className="w-4 h-4 text-neutral-400" />
                                    <span>{doctor.experienceYears} years experience</span>
                                </div>
                                <div className="flex items-center text-sm text-neutral-600 gap-2">
                                    <MapPin className="w-4 h-4 text-neutral-400" />
                                    <span className="truncate">{doctor.clinicAddress || "Remote / Online"}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-neutral-50 flex items-center justify-between">
                                <div className="text-neutral-900 font-bold">
                                    Rs. {doctor.fee} <span className="text-xs text-neutral-500 font-normal">/ visit</span>
                                </div>
                                <Button
                                    onClick={() => handleBookClick(doctor)}
                                    className="rounded-full px-6 bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-200"
                                >
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center">
                            <h3 className="text-lg font-medium text-neutral-900">No doctors found</h3>
                            <p className="text-neutral-500">Try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            )}

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                doctor={selectedDoctor}
            />
        </div>
    );
}
