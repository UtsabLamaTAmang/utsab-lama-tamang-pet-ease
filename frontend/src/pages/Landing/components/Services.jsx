import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Check, Home, ShoppingBag, Shield, Stethoscope, Heart, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Services() {
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

    const services = [
        {
            icon: Home,
            title: "Pet Adoption",
            desc: "Discover verified pets and connect with trusted shelters. Every profile includes health records and transparent history.",
            features: ["Health-checked pets", "Transparent history", "Guided onboarding"],
            gradient: "from-rose-500 to-pink-600",
            bgGlow: "bg-rose-400",
            link: "#adoption",
        },
        {
            icon: ShoppingBag,
            title: "Pet Store",
            desc: "Curated food, toys, and accessories your pet will love. Quality-first products rated by real pet parents.",
            features: ["Quality first", "Community-rated", "Fast delivery"],
            gradient: "from-secondary-500 to-secondary-600",
            bgGlow: "bg-secondary-400",
            link: "#store",
        },
        {
            icon: Stethoscope,
            title: "Vet Consultation",
            desc: "Book appointments with certified veterinary professionals. Get expert care, digital prescriptions, and follow-up notes for your pet.",
            features: ["Certified vets only", "Digital prescriptions", "Follow-up care notes"],
            gradient: "from-info-500 to-info-600",
            bgGlow: "bg-info-400",
            link: "#vets",
        },
        {
            icon: Shield,
            title: "Pet Rescue",
            desc: "Emergency rescue services for pets in need. 24/7 response with trained rescue teams.",
            features: ["24/7 emergency response", "Trained rescue teams", "Safe rehabilitation"],
            gradient: "from-amber-500 to-orange-600",
            bgGlow: "bg-amber-400",
            link: "/login",
        },
    ];

    return (
        <section
            id="services"
            ref={sectionRef}
            className="relative px-4 sm:px-6 lg:px-8 py-20 overflow-hidden dot-grid"
        >
            <div
                className={`max-w-7xl mx-auto w-full transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-50 border border-primary-200 text-sm font-semibold text-primary-700 mb-6">
                        WHY PETEASE
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                        Everything you need,{" "}
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            without juggling apps
                        </span>
                    </h2>
                    <p className="text-lg text-neutral-600 mt-6 max-w-2xl mx-auto leading-relaxed">
                        Adoption, products, and healthcare live in one calm, structured
                        flow—so you spend less time managing tools and more time with
                        your pet.
                    </p>
                </div>

                {/* Service Cards - 2x2 grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <a
                                key={service.title}
                                href={service.link}
                                className={`group relative rounded-3xl glass-white p-8 hover-lift overflow-hidden cursor-pointer transition-all duration-500 no-underline ${isVisible ? "animate-scale-in" : "opacity-0"}`}
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                {/* Hover gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                                {/* Glow blob */}
                                <div className={`absolute -top-8 -right-8 w-32 h-32 ${service.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                                <div className="relative z-10 flex gap-6">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
                                            {service.desc}
                                        </p>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
                                            {service.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-2">
                                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Check className="w-3 h-3 text-success-600" />
                                                    </div>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-neutral-400 group-hover:text-primary-600 transition-colors duration-300">
                                            <span>Learn more</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
