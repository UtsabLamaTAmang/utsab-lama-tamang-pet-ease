import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Check, Stethoscope, Users, Star, Heart, PawPrint, Quote } from "lucide-react";
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

    const features = [
        "Certified veterinary partners only",
        "Structured intake forms before each appointment",
        "Digital prescriptions and care plans",
        "Reminders for vaccines, deworming, and checkups",
    ];

    const testimonials = [
        {
            name: "Aarav Sharma",
            title: "Dog Parent, Kathmandu",
            quote: "Adopting through PetEase felt safe and well-organized. We had all the info we needed before bringing Max home.",
            rating: 5,
            avatar: "A",
        },
        {
            name: "Sneha Karki",
            title: "Cat Parent, Pokhara",
            quote: "Booking a vet through PetEase was effortless. The doctor was thorough, and I got a detailed prescription the same day.",
            rating: 5,
            avatar: "S",
        },
    ];

    return (
        <section
            id="vets"
            ref={sectionRef}
            className="relative px-4 sm:px-6 lg:px-8 py-24 overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 40%, #f0fdfa 70%, #faf5ff 100%)",
            }}
        >
            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 text-primary-200 animate-float opacity-30" style={{ animationDuration: "7s" }}>
                    <PawPrint className="w-12 h-12" />
                </div>
                <div className="absolute bottom-32 left-16 text-secondary-200 animate-float opacity-25" style={{ animationDuration: "6s", animationDelay: "2s" }}>
                    <Heart className="w-10 h-10" />
                </div>
                <div className="absolute top-1/2 right-1/3 text-primary-200 animate-float opacity-20" style={{ animationDuration: "8s", animationDelay: "4s" }}>
                    <PawPrint className="w-8 h-8 rotate-45" />
                </div>
            </div>

            <div
                className={`max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                {/* Left: Vets Info */}
                <div>
                    <p className="text-sm font-bold text-info-600 tracking-widest mb-3">VET CONSULTATION</p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                        Expert vet care, when your pet needs it.
                    </h2>
                    <p className="text-base text-neutral-600 mt-4 mb-10 max-w-xl leading-relaxed">
                        Book appointments with verified, reviewed veterinary professionals. Get digital prescriptions, structured care plans, and timely follow-ups—all in one place.
                    </p>

                    <div className="space-y-4 mb-10">
                        {features.map((feature, idx) => (
                            <div
                                key={feature}
                                className={`flex items-center gap-4 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                                    }`}
                                style={{ transitionDelay: `${idx * 150 + 300}ms` }}
                            >
                                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center shadow-sm">
                                    <Check className="w-4 h-4 text-success-600" />
                                </div>
                                <span className="text-neutral-700 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="group shimmer-btn cursor-pointer inline-flex items-center gap-2 text-base font-semibold px-7 py-3.5 rounded-2xl bg-neutral-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 hover:bg-neutral-800"
                        >
                            Book an appointment
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                        <button
                            onClick={() => navigate('/doctor-signup')}
                            className="group cursor-pointer inline-flex items-center gap-2 text-base font-semibold px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-600/30 transition-all duration-300 active:scale-95"
                        >
                            <Stethoscope className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                            Register as Doctor
                        </button>
                    </div>
                </div>

                {/* Right: Testimonials */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-neutral-500">
                        <Users className="w-5 h-5" />
                        <span>What other pet parents are saying</span>
                    </div>

                    <div className="grid gap-5">
                        {testimonials.map((t, index) => (
                            <div
                                key={t.name}
                                className={`group rounded-3xl glass-white p-7 hover-lift transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                                    }`}
                                style={{ transitionDelay: `${(index + 2) * 200}ms` }}
                            >
                                {/* Quote icon */}
                                <div className="mb-4">
                                    <Quote className="w-8 h-8 text-primary-200 group-hover:text-primary-300 transition-colors duration-300" />
                                </div>

                                {/* Stars */}
                                <div className="flex items-center gap-0.5 mb-3">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <p className="text-neutral-700 italic leading-relaxed mb-5">"{t.quote}"</p>

                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {t.avatar}
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
