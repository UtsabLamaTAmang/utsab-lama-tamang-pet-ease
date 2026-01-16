import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Filter, Heart, Plus } from "lucide-react";
import AddPetModal from "@/components/pet/AddPetModal";

// Helper to get user location
const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }),
                (error) => reject(error)
            );
        }
    });
};

// Helper to shorten address (e.g., "Street, City, Country" -> "Street, City")
const formatAddress = (address) => {
    if (!address) return "Location N/A";
    const parts = address.split(',').map(p => p.trim());
    // If we have > 2 parts, try to show the first two meaningful ones (often Street + City)
    // Or if it looks like "Street, Ward, City, Dist, Province, Country", maybe just "City, District" is better?
    // Let's stick to the first 2 parts for brevity as requested "shorten... make it clean"
    if (parts.length > 2) {
        return `${parts[0]}, ${parts[1]}`;
    }
    return address;
};

const fetchPets = async ({ queryKey }) => {
    const [_, params] = queryKey;
    const { search, location, species, page, ...rest } = params;

    const queryParams = new URLSearchParams(rest);
    if (search) queryParams.append('search', search);
    if (location) queryParams.append('location', location);
    if (species && species !== "ALL") queryParams.append('species', species);
    queryParams.append('page', page);
    queryParams.append('limit', 9);

    const response = await axios.get(`http://localhost:5000/api/pets?${queryParams.toString()}`);
    return response.data;
};

export default function AdoptionFeed() {
    const [userLocation, setUserLocation] = useState(null);
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [speciesFilter, setSpeciesFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const queryClient = useQueryClient();

    // Get location on mount to sort by distance
    useEffect(() => {
        getUserLocation()
            .then(loc => setUserLocation(loc))
            .catch(err => console.log("Location access denied"));
    }, []);

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['pets', { search, location: locationFilter, species: speciesFilter, page, lat: userLocation?.lat, lng: userLocation?.lng }],
        queryFn: fetchPets,
        keepPreviousData: true
    });

    const pets = responseData?.data || [];
    const pagination = responseData?.pagination;

    return (
        <div className="space-y-8">

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Find a Pet</h1>
                    <p className="text-neutral-500">Browse pets available for adoption near you.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-white rounded-full border-neutral-200 focus-visible:ring-primary-500"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Location */}
                    <div className="relative w-full sm:w-48">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Location"
                            className="pl-9 bg-white rounded-full border-neutral-200 focus-visible:ring-primary-500"
                            value={locationFilter}
                            onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Species Select */}
                    <div className="relative w-full sm:w-40">
                        <select
                            className="w-full h-10 bg-white border border-neutral-200 rounded-full px-4 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer hover:border-primary-400 transition-colors"
                            value={speciesFilter}
                            onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
                        >
                            <option value="ALL">All Types</option>
                            <option value="DOG">Dog</option>
                            <option value="CAT">Cat</option>
                            <option value="BIRD">Bird</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {/* Custom Arrow */}
                        <div className="absolute right-3 top-3 pointer-events-none">
                            <Filter className="w-4 h-4 text-neutral-400" />
                        </div>
                    </div>

                    <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200 transition-all hover:scale-105 active:scale-95 rounded-full px-6 whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        List a Pet
                    </Button>
                </div>
            </div>

            {/* Removed old Filters div since they are now in header */}

            {/* Pet Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[450px] bg-neutral-50 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pets.length > 0 ? pets.map((pet) => (
                            <div key={pet.id} onClick={() => window.location.href = `/pets/${pet.id}`} className="group cursor-pointer relative bg-white rounded-[2rem] overflow-hidden border border-neutral-100 hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-500 hover:-translate-y-2">
                                {/* Image Section */}
                                <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                                    {pet.images && pet.images.length > 0 ? (
                                        <img
                                            src={`http://localhost:5000${pet.images[0]}`}
                                            alt={pet.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-50">
                                            <Heart className="w-16 h-16 opacity-50" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                                    {/* Status / Species Badge */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className="bg-white/20 backdrop-blur-md text-white border-0 px-3 py-1.5 font-medium">
                                            {pet.species}
                                        </Badge>
                                        {pet.status !== 'AVAILABLE' && (
                                            <Badge className="bg-red-500 text-white border-0 px-3 py-1.5 font-bold uppercase tracking-wider text-[10px]">
                                                {pet.status}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Price Badge */}
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-white text-neutral-900 px-4 py-1.5 rounded-full font-bold shadow-lg text-sm flex items-center gap-1">
                                            {pet.adoptionFee ? `Rs. ${pet.adoptionFee}` : 'Free'}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-3xl font-bold leading-none mb-2">{pet.name}</h3>
                                        <div className="flex items-center justify-between opacity-90">
                                            <div className="flex items-center text-sm font-medium">
                                                <MapPin className="w-4 h-4 mr-1.5 text-primary-400" />
                                                {formatAddress(pet.address)}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-medium">
                                                <span>{pet.age} yrs</span>
                                                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                                <span>{pet.gender}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect Content (Optional Description peek) */}
                                <div className="h-2 bg-primary-500 w-0 group-hover:w-full transition-all duration-700"></div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900">No pets found</h3>
                                <p className="text-neutral-500">Try adjusting your filters or search area.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-24 border-neutral-200"
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-neutral-500">
                                Page {page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="w-24 border-neutral-200"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            <AddPetModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries(['pets']);
                }}
            />
        </div>
    );
}
