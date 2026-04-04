import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Clock, Heart, ShoppingBag, Users, Stethoscope, PawPrint } from "lucide-react";

function AnimatedCounter({ target, suffix = "+", duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = Date.now();
                    const numericTarget = parseInt(target.replace(/\D/g, ""));
                    const tick = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * numericTarget));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    const numericTarget = parseInt(target.replace(/\D/g, ""));
    const prefix = target.includes("K") ? "" : "";
    const displaySuffix = target.includes("K") ? "K" + suffix : suffix;

    return (
        <span ref={ref}>
            {count >= numericTarget ? target : `${count}${target.includes("K") ? "K" : ""}${suffix}`}
        </span>
    );
}

export default function Hero() {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section
            className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #faf5ff 0%, #f0e6ff 30%, #e9d5ff 60%, #f0fdfa 100%)",
            }}
        >
            {/* Animated Morphing Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[500px] h-[500px] bg-gradient-to-br from-primary-300 to-primary-400 animate-morph mix-blend-multiply filter blur-3xl opacity-25"
                    style={{
                        top: `${10 + scrollY * 0.02}%`,
                        left: "5%",
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] bg-gradient-to-br from-secondary-300 to-secondary-400 animate-morph mix-blend-multiply filter blur-3xl opacity-20"
                    style={{
                        top: `${55 - scrollY * 0.015}%`,
                        right: "5%",
                        animationDelay: "2s",
                    }}
                />
                <div
                    className="absolute w-[350px] h-[350px] bg-gradient-to-br from-accent-200 to-primary-200 animate-morph mix-blend-multiply filter blur-3xl opacity-20"
                    style={{
                        bottom: `${5 + scrollY * 0.01}%`,
                        left: "40%",
                        animationDelay: "4s",
                    }}
                />

                {/* Floating decorative dots */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-primary-400 opacity-15 animate-float"
                        style={{
                            width: `${8 + i * 4}px`,
                            height: `${8 + i * 4}px`,
                            top: `${15 + i * 14}%`,
                            left: `${10 + i * 15}%`,
                            animationDelay: `${i * 0.8}s`,
                            animationDuration: `${5 + i}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left: Text */}
                <div className="space-y-8 animate-fade-in">


                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                        A calm, organized way to{" "}
                        <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent animate-gradient-shift" style={{ backgroundSize: "200% 200%" }}>
                            care for your pet
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-neutral-600 max-w-xl leading-relaxed">
                        PetEase brings adoption, curated products, and expert veterinary
                        care into one simple experience—built for real pet parents, not
                        just apps.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => navigate("/signup")}
                            className="group shimmer-btn inline-flex cursor-pointer items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-lg font-semibold shadow-xl shadow-primary-600/25 hover:shadow-2xl hover:shadow-primary-600/30 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            Explore PetEase
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </button>
                        <button className="inline-flex cursor-pointer items-center gap-2 px-8 py-4 rounded-2xl border-2 border-neutral-200 bg-white/60 backdrop-blur-sm text-lg font-medium text-neutral-700 hover:bg-white hover:border-primary-300 hover:shadow-lg transition-all duration-300 hover:scale-105">
                            <Clock className="w-5 h-5" />
                            Watch demo
                        </button>
                    </div>

                    {/* Animated Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                        {[
                            { value: "10K", label: "Happy Pets", icon: Heart, color: "from-pink-500 to-rose-500" },
                            { value: "5K", label: "Adoptions", icon: Users, color: "from-primary-500 to-primary-600" },
                            { value: "15K", label: "Products", icon: ShoppingBag, color: "from-secondary-500 to-secondary-600" },
                            { value: "8K", label: "Consultations", icon: Stethoscope, color: "from-info-500 to-info-600" },
                        ].map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="group text-center p-5 rounded-2xl glass-white hover:shadow-xl transition-all duration-300 hover-lift cursor-pointer animate-scale-in"
                                    style={{ animationDelay: `${index * 100 + 400}ms` }}
                                >
                                    <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-neutral-900">
                                        <AnimatedCounter target={stat.value} />
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1 font-medium">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Interactive Card */}
                <div
                    className="lg:justify-self-end w-full max-w-md animate-tilt-in"
                    style={{ animationDelay: "300ms" }}
                >
                    <div className="relative group">
                        {/* Animated glow border */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />

                        <div className="relative rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 shadow-2xl overflow-hidden">
                            <div className="h-72 w-full overflow-hidden relative">
                                <img
                                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80"
                                    alt="Happy dog with owner"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-xs text-white/90 font-medium tracking-wide">Live Dashboard</span>
                                    </div>
                                    <p className="text-white font-bold text-xl">Today at a glance</p>
                                </div>

                                {/* Floating paw icon */}
                                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDuration: "4s" }}>
                                    <PawPrint className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Adoptions", value: "38", icon: Heart, color: "text-pink-500 bg-pink-50" },
                                        { label: "Orders", value: "214", icon: ShoppingBag, color: "text-secondary-600 bg-secondary-50" },
                                        { label: "Appointments", value: "19", icon: Stethoscope, color: "text-info-600 bg-info-50" },
                                    ].map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-neutral-100 p-3.5 hover:border-primary-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white group/card"
                                            >
                                                <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center mb-2 group-hover/card:scale-110 transition-transform`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <p className="text-2xl font-bold text-neutral-900">{item.value}</p>
                                                <p className="text-[10px] text-neutral-500 mt-1 font-medium">{item.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-50/80 to-secondary-50/80 border border-primary-100/50 px-4 py-3">
                                    <div className="flex-1">
                                        <p className="text-xs text-neutral-600 italic leading-relaxed">"Feels like everything is finally in one place."</p>
                                        <p className="text-xs font-semibold text-neutral-800 mt-1.5">– PetEase user</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-primary-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave divider at bottom */}
            <div className="wave-divider" style={{ bottom: -1 }}>
                <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="white">
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
                </svg>
            </div>
        </section>
    );
}
