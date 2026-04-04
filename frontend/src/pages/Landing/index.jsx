import React from "react";
import Navbar from "@/components/common/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Adoption from "./components/Adoption";
import Store from "./components/Store";
import Vets from "./components/Vets";

export default function Landing() {
    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
            <Navbar />
            <main>
                <Hero />
                <Services />
                <Adoption />
                <Store />
                <Vets />
            </main>

            {/* Footer - Dark gradient */}
            <footer className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 pt-20 pb-8 overflow-hidden">
                {/* Animated accent line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />

                {/* Subtle glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary-600 rounded-full blur-[120px] opacity-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                        {/* Brand */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/30">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white">
                                    Pet<span className="text-primary-400">Ease</span>
                                </span>
                            </div>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Making pet care simple, organized, and accessible for everyone. Adoption, supplies, and vet care in one place.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-semibold text-white mb-5">Platform</h3>
                            <ul className="space-y-3 text-sm">
                                {[
                                    { label: "Services", href: "#services" },
                                    { label: "Adoption", href: "#adoption" },
                                    { label: "Store", href: "#store" },
                                    { label: "Vet Consultation", href: "#vets" },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            className="text-neutral-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group"
                                        >
                                            <span className="w-0 h-px bg-primary-400 group-hover:w-3 transition-all duration-300" />
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="font-semibold text-white mb-5">Support</h3>
                            <ul className="space-y-3 text-sm">
                                {["Help Center", "Safety Center", "Community Guidelines", "Privacy Policy"].map((item) => (
                                    <li key={item}>
                                        <a
                                            href="#"
                                            className="text-neutral-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group"
                                        >
                                            <span className="w-0 h-px bg-primary-400 group-hover:w-3 transition-all duration-300" />
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h3 className="font-semibold text-white mb-5">Stay updated</h3>
                            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                                Get the latest tips on pet care and adoption updates.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-neutral-800/50 border border-neutral-700 text-neutral-300 text-sm rounded-xl px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 placeholder:text-neutral-500"
                                />
                                <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary-600/25 transition-all duration-300 active:scale-95 flex-shrink-0">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-neutral-500 text-xs">© 2026 PetEase. All rights reserved.</p>
                        <div className="flex gap-5">
                            {/* Facebook */}
                            <a href="#" className="group w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-600 transition-all duration-300 hover:scale-110">
                                <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            {/* Twitter */}
                            <a href="#" className="group w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-600 transition-all duration-300 hover:scale-110">
                                <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a href="#" className="group w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-600 transition-all duration-300 hover:scale-110">
                                <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
