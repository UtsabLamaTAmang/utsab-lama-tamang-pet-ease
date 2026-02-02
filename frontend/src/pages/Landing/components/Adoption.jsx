import React, { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function Adoption() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

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

    const pets = [
        {
            name: "Max",
            breed: "Golden Retriever",
            age: "2 years",
            image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
            price: "Free",
            status: "Available",
        },
        {
            name: "Luna",
            breed: "Persian Cat",
            age: "1 year",
            image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80",
            price: "Free",
            status: "Available",
        },
        {
            name: "Charlie",
            breed: "Beagle",
            age: "3 years",
            image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
            price: "Free",
            status: "Reserved",
        },
        {
            name: "Bella",
            breed: "Siamese Cat",
            age: "2 years",
            image: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=800&q=80",
            price: "Free",
            status: "Available",
        },
    ];

    return (
        <section
            id="adoption"
            ref={sectionRef}
            className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-neutral-50 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
        >
            <div className="max-w-7xl mx-auto w-full py-16">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 text-center md:text-left">
                    <div className="max-w-2xl mx-auto md:mx-0">
                        <p className="text-sm font-semibold text-primary-700 mb-2">ADOPTION</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
                            Find a pet that fits your life.
                        </h2>
                        <p className="text-base text-neutral-600 mt-4 max-w-2xl">
                            Every pet profile includes health checks, history, and expectations— so you can make a confident, long-term decision.
                        </p>
                    </div>
                    <button className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800">
                        View all pets
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pets.map((pet, index) => (
                        <div
                            key={pet.name}
                            className="rounded-2xl bg-white border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-48 w-full">
                                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                                {pet.status === "Reserved" && (
                                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warning-100 text-warning-800 text-[11px] font-medium">
                                        Reserved
                                    </div>
                                )}
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-neutral-900">{pet.name}</p>
                                    <span className="text-sm font-medium text-success-700">{pet.price}</span>
                                </div>
                                <p className="text-xs text-neutral-600">{pet.breed}</p>
                                <p className="text-xs text-neutral-500">{pet.age} old</p>
                                <div className="flex gap-2 pt-2">
                                    <button className="flex-1 text-xs font-semibold px-3 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 cursor-pointer">
                                        Start adoption
                                    </button>
                                    <button className="px-3 py-2 rounded-full border border-neutral-200 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
