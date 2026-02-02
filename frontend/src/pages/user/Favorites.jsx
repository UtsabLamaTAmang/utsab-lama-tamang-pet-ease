import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Heart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Favorites() {
    const queryClient = useQueryClient();
    const [removingId, setRemovingId] = useState(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['favorites'],
        queryFn: wishlistAPI.getAll,
    });

    const favorites = response?.data || [];
    // Filter only pets for now (user requested pet functionality)
    const favoritePets = favorites.filter(item => item.pet).map(item => ({ ...item.pet, wishlistId: item.id }));

    const handleRemove = async (petId) => {
        setRemovingId(petId);
        try {
            await wishlistAPI.toggle({ petId }); // Toggle removes it if exists
            toast.success("Removed from favorites");
            queryClient.invalidateQueries(['favorites']);
        } catch (error) {
            toast.error("Failed to remove");
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Your Favorites</h1>
                    <p className="text-neutral-500">Manage the pets you have saved.</p>
                </div>
            </div>

            {/* Pet Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[400px] bg-neutral-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritePets.length > 0 ? favoritePets.map((pet) => (
                        <div key={pet.id} className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-100 hover:shadow-2xl hover:shadow-red-50 transition-all duration-500 hover:-translate-y-1">
                            {/* Image Section */}
                            <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden cursor-pointer" onClick={() => window.location.href = `/pets/${pet.id}`}>
                                {pet.images && pet.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:5000${pet.images[0]}`}
                                        alt={pet.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-50">
                                        <Heart className="w-16 h-16 opacity-50" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                <Badge className="absolute top-4 left-4 bg-white/95 text-neutral-900 shadow-sm backdrop-blur-md px-3 py-1 font-semibold text-xs border-0">
                                    {pet.species}
                                </Badge>

                                <button
                                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md hover:bg-red-50 text-red-500 rounded-full transition-all duration-300 shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(pet.id);
                                    }}
                                    disabled={removingId === pet.id}
                                >
                                    {removingId === pet.id ? (
                                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>

                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="text-2xl font-bold leading-none mb-1">{pet.name}</h3>
                                    <div className="flex items-center text-sm text-white/90 font-medium">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        {pet.address ? pet.address.split(',')[0] : "Location N/A"}
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 font-medium text-xs">
                                            {pet.age} yrs
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 font-medium text-xs">
                                            {pet.gender}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{pet.breed}</span>
                                </div>

                                <Button
                                    className="w-full bg-neutral-900 hover:bg-black text-white shadow-lg shadow-neutral-200"
                                    onClick={() => window.location.href = `/pets/${pet.id}`}
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-neutral-100 border-dashed">
                            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <Heart className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-lg font-medium text-neutral-900">No favorites yet</h3>
                            <p className="text-neutral-500 max-w-sm mx-auto mt-1">
                                Go to the adoption feed and click the heart icon to save pets you love.
                            </p>
                            <Button
                                className="mt-6"
                                variant="outline"
                                onClick={() => window.location.href = '/user/adoption'}
                            >
                                Browse Pets
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
