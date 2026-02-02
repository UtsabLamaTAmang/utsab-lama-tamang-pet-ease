import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Check, Stethoscope, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Vets() {
    const navigate = useNavigate();
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

    const testimonials = [
        {
            name: "Aarav Sharma",
            title: "Dog Parent, Kathmandu",
            quote: "Adopting through PetEase felt safe and well-organized. We had all the info we needed before bringing Max home.",
        },
        {
            name: "Sneha Karki",
            title: "Cat Parent, Pokhara",
            quote: "The online vet consultation saved us a late-night hospital visit. The experience was smooth and reassuring.",
        },
    ];

    return (
        <section
            id="vets"
            ref={sectionRef}
            className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-neutral-50 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
        >
            <div className="max-w-7xl mx-auto w-full py-16 grid lg:grid-cols-2 gap-12 items-center">
                {/* Vets */}
                <div className="animate-fade-in">
                    <p className="text-sm font-semibold text-info-700 mb-2">VET CONSULTATION</p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
                        Talk to a vet before it feels urgent.
                    </h2>
                    <p className="text-base text-neutral-600 mt-4 mb-8 max-w-xl">
                        Book video calls, share records, and receive digital prescriptions. Our vet partners are verified and reviewed.
                    </p>

                    <div className="space-y-4 text-base text-neutral-700 mb-8">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                            <span>Certified veterinary partners only</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                            <span>Structured intake forms before each call</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                            <span>Follow-up notes and care plans</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                            <span>Reminders for vaccines, deworming, and checkups</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="cursor-pointer inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl transition-all active:scale-95">
                            Schedule a vet call
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => navigate('/doctor-signup')}
                            className="cursor-pointer inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
                        >
                            <Stethoscope className="w-5 h-5" />
                            Register as Doctor
                        </button>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                        <Users className="w-5 h-5 text-neutral-500" />
                        <span>What other pet parents are saying</span>
                    </div>

                    <div className="grid gap-4">
                        {testimonials.map((t, index) => (
                            <div
                                key={t.name}
                                className="rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300"
                                style={{ animationDelay: `${(index + 2) * 100}ms` }}
                            >
                                <div>
                                    <p className="text-neutral-800 italic">"{t.quote}"</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                                        <p className="text-xs text-neutral-500">{t.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
