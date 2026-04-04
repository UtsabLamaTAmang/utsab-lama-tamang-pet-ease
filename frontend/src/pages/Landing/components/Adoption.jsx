import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { petAPI } from "@/services/api";

export default function Adoption() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await petAPI.getAll({ limit: 4, status: "available" });
                const data = response.pets || response.data || response;
                if (Array.isArray(data) && data.length > 0) {
                    setPets(data.slice(0, 4));
                } else {
                    setPets(fallbackPets);
                }
            } catch (error) {
                setPets(fallbackPets);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    const fallbackPets = [
        {
            id: 1,
            name: "Max",
            breed: "Golden Retriever",
            age: "2 years",
            images: ["https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80"],
            status: "available",
        },
        {
            id: 2,
            name: "Luna",
            breed: "Persian Cat",
            age: "1 year",
            images: ["https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80"],
            status: "available",
        },
        {
            id: 3,
            name: "Charlie",
            breed: "Beagle",
            age: "3 years",
            images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"],
            status: "reserved",
        },
        {
            id: 4,
            name: "Bella",
            breed: "Siamese Cat",
            age: "2 years",
            images: ["https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80"],
            status: "available",
        },
    ];

    const displayPets = pets.length > 0 ? pets : fallbackPets;

    const getPetImage = (pet) => {
        if (pet.images && pet.images.length > 0) {
            const img = pet.images[0];
            if (img.startsWith("http")) return img;
            return `http://localhost:5000${img}`;
        }
        return "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80";
    };

    const getPetAge = (pet) => {
        if (typeof pet.age === "number") return `${pet.age} yrs`;
        if (typeof pet.age === "string") {
            return pet.age.includes("old") ? pet.age : `${pet.age} old`;
        }
        return "Unknown";
    };

    return (
        <section
            id="adoption"
            ref={sectionRef}
            className="relative px-4 sm:px-6 lg:px-8 py-20 overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 30%, #f3e8ff 70%, #ffffff 100%)",
            }}
        >
            <div
                className={`max-w-7xl mx-auto w-full transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 text-center md:text-left">
                    <div className="max-w-2xl mx-auto md:mx-0">
                        <p className="text-sm font-bold text-primary-600 tracking-widest mb-3">ADOPTION</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                            Find a pet that fits your life.
                        </h2>
                        <p className="text-base text-neutral-600 mt-4 max-w-2xl leading-relaxed">
                            Every pet profile includes health checks, history, and expectations—so you can make a confident, long-term decision.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/login")}
                        className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:gap-3 transition-all duration-300 cursor-pointer"
                    >
                        View all pets
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Pet Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {loading
                        ? [...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white border border-neutral-100 overflow-hidden animate-pulse">
                                <div className="h-48 bg-neutral-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                                    <div className="h-9 bg-neutral-200 rounded-xl" />
                                </div>
                            </div>
                        ))
                        : displayPets.map((pet, index) => (
                            <div
                                key={pet.id || pet.name}
                                className="group rounded-2xl bg-white border border-neutral-100 overflow-hidden hover-lift cursor-pointer transition-all duration-500"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                        src={getPetImage(pet)}
                                        alt={pet.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80";
                                        }}
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Status badge */}
                                    <div className="absolute top-3 left-3">
                                        {(pet.status === "reserved" || pet.status === "RESERVED") ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/90 backdrop-blur-sm text-amber-800 text-[11px] font-semibold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Reserved
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100/90 backdrop-blur-sm text-green-800 text-[11px] font-semibold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Available
                                            </div>
                                        )}
                                    </div>

                                    {/* Heart icon */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate("/login"); }}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                                    >
                                        <Heart className="w-4 h-4 text-rose-500" />
                                    </button>

                                    {/* Bottom accent line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </div>

                                <div className="p-4 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-neutral-900">{pet.name}</p>
                                        <span className="text-[11px] font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">Free</span>
                                    </div>
                                    <p className="text-xs text-neutral-500">{pet.breed} • {getPetAge(pet)}</p>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-lg hover:shadow-primary-600/25 transition-all duration-300 cursor-pointer active:scale-95"
                                        >
                                            Adopt now
                                        </button>
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 cursor-pointer transition-all duration-300"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Mobile CTA */}
                <div className="md:hidden text-center mt-8">
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 cursor-pointer"
                    >
                        View all pets
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
