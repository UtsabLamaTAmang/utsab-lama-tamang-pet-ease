import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Check, Home, ShoppingBag, Shield, Stethoscope } from "lucide-react";

export default function Services() {
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
            desc: "Discover verified pets and connect with trusted shelters.",
            features: ["Health-checked pets", "Transparent history", "Guided onboarding"],
            gradient: "from-danger-500 to-danger-600",
            bgColor: "bg-danger-50",
        },
        {
            icon: ShoppingBag,
            title: "Pet Store",
            desc: "Curated food, toys, and accessories your pet will love.",
            features: ["Quality first", "Community-rated", "Fast delivery"],
            gradient: "from-secondary-500 to-secondary-600",
            bgColor: "bg-secondary-50",
        },
        {
            icon: Stethoscope,
            title: "Vet Consultation",
            desc: "Talk to certified vets from the comfort of your home.",
            features: ["Video calls", "Digital prescriptions", "Follow-up notes"],
            gradient: "from-info-500 to-info-600",
            bgColor: "bg-info-50",
        },
        {
            icon: Shield,
            title: "Pet Rescue",
            desc: "Emergency rescue services for pets in need of help.",
            features: ["24/7 emergency response", "Trained rescue teams", "Safe rehabilitation"],
            gradient: "from-warning-500 to-warning-600",
            bgColor: "bg-warning-50",
        },
    ];

    return (
        <section
            id="services"
            ref={sectionRef}
            className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
        >
            <div className="max-w-7xl mx-auto w-full py-16">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 text-center md:text-left">
                    <div className="max-w-2xl mx-auto md:mx-0 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 text-sm font-medium text-primary-700 mb-4">
                            WHY PETEASE
                        </div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900">
                            Everything you need,{" "}
                            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                without juggling apps
                            </span>
                        </h2>
                        <p className="text-lg text-neutral-600 mt-6 max-w-2xl">
                            Adoption, products, and healthcare live in one calm, structured
                            flow— so you spend less time managing tools and more time with
                            your pet.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={service.title}
                                className="group relative rounded-3xl bg-white border border-neutral-200 p-8 hover:border-transparent transition-all duration-500 hover-lift animate-scale-in overflow-hidden cursor-pointer"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                <div className="relative mb-6">
                                    <div className={`absolute inset-0 ${service.bgColor} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-neutral-900 group-hover:to-neutral-600 transition-all">
                                    {service.title}
                                </h3>
                                <p className="text-base text-neutral-600 mb-6 leading-relaxed">
                                    {service.desc}
                                </p>
                                <ul className="space-y-3 text-sm text-neutral-700">
                                    {service.features.map((feature, idx) => (
                                        <li key={feature} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${(index * 3 + idx) * 100}ms` }}>
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Check className="w-3 h-3 text-success-600" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-400 group-hover:text-primary-600 transition-colors">
                                    <span>Learn more</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
