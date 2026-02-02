import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Clock, Heart, ShoppingBag, Users, Stethoscope } from "lucide-react";

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section
            className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)",
            }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
                    style={{ top: "10%", left: "10%" }}
                />
                <div
                    className="absolute w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"
                    style={{ top: "60%", right: "10%", animationDelay: "2s" }}
                />
                <div
                    className="absolute w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
                    style={{ bottom: "10%", left: "50%", animationDelay: "4s" }}
                />
            </div>

            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left: Text */}
                <div className="space-y-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary-200 text-sm font-medium text-primary-700 shadow-lg animate-scale-bounce">
                        <Sparkles className="w-4 h-4 animate-wiggle" />
                        One platform for adoption, store & vets
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-tight">
                        A calm, organized way to{" "}
                        <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            care for your pet
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-neutral-700 max-w-xl leading-relaxed">
                        PetEase brings adoption, curated products, and expert veterinary
                        care into one simple experience—built for real pet parents, not
                        just apps.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => navigate("/signup")}
                            className="group inline-flex cursor-pointer items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white text-lg font-semibold hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            Explore PetEase
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="inline-flex cursor-pointer items-center gap-2 px-8 py-4 rounded-full border-2 border-neutral-300 bg-white/50 backdrop-blur-sm text-lg font-medium text-neutral-700 hover:bg-white hover:border-primary-300 transition-all hover:scale-105">
                            <Clock className="w-5 h-5" />
                            Watch demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                        {[
                            { value: "10K+", label: "Happy Pets", icon: Heart },
                            { value: "5K+", label: "Adoptions", icon: Users },
                            { value: "15K+", label: "Products", icon: ShoppingBag },
                            { value: "8K+", label: "Consultations", icon: Stethoscope },
                        ].map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all hover:scale-105 hover-lift animate-scale-in cursor-pointer"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Icon className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                                    <p className="text-xs text-neutral-600">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Interactive Card */}
                <div
                    className="lg:justify-self-end w-full max-w-md animate-scale-in"
                    style={{ animationDelay: "300ms" }}
                >
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-glow"></div>

                        <div className="relative rounded-3xl bg-white border border-neutral-200 shadow-2xl overflow-hidden hover:shadow-3xl transition-all">
                            <div className="h-72 w-full overflow-hidden relative">
                                <img
                                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80"
                                    alt="Happy dog with owner"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse-soft"></div>
                                        <span className="text-xs text-white font-medium">Live Dashboard</span>
                                    </div>
                                    <p className="text-white font-semibold text-lg">Today at a glance</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Adoptions", value: "38", icon: Heart },
                                        { label: "Orders", value: "214", icon: ShoppingBag },
                                        { label: "Vet calls", value: "19", icon: Stethoscope },
                                    ].map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-neutral-200 p-3 hover:border-primary-300 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer animate-slide-up"
                                                style={{ animationDelay: `${(index + 3) * 100}ms` }}
                                            >
                                                <Icon className="w-4 h-4 text-primary-600 mb-2" />
                                                <p className="text-2xl font-bold text-neutral-900">{item.value}</p>
                                                <p className="text-[10px] text-neutral-500 mt-1">{item.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 px-4 py-3 hover:shadow-md transition-all">
                                    <div>
                                        <p className="text-xs text-neutral-600 italic">"Feels like everything is finally in one place."</p>
                                        <p className="text-xs font-medium text-neutral-800 mt-1">– PetEase user</p>
                                    </div>
                                    <Users className="w-5 h-5 text-primary-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
