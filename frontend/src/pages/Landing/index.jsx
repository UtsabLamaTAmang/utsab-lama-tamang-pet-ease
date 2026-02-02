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

            {/* Footer */}
            <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                        {/* Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-4 h-4 text-white fill-current"
                                    >
                                        <path d="M19 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z"></path>
                                        <path d="M24 12v12h-24v-12h24z" fill="none" stroke="none"></path>
                                        <path d="M19 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z" fill="currentColor"></path>
                                    </svg>
                                    {/* Using a simple heart icon placeholder logic or SVG since Logo import might be tricky in this scope without standardizing */}
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>

                                </div>
                                <span className="text-xl font-bold tracking-tight text-neutral-900">Pet<span className="text-primary-600">Ease</span></span>
                            </div>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Making pet care simple, organized, and accessible for everyone. Adoption, supplies, and vet care in one place.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-semibold text-neutral-900 mb-4">Platform</h3>
                            <ul className="space-y-3 text-sm text-neutral-500">
                                <li><a href="#services" className="hover:text-primary-600 transition-colors">Services</a></li>
                                <li><a href="#adoption" className="hover:text-primary-600 transition-colors">Adoption</a></li>
                                <li><a href="#store" className="hover:text-primary-600 transition-colors">Store</a></li>
                                <li><a href="#vets" className="hover:text-primary-600 transition-colors">Vet Consultation</a></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="font-semibold text-neutral-900 mb-4">Support</h3>
                            <ul className="space-y-3 text-sm text-neutral-500">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Safety Center</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Community Guidelines</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h3 className="font-semibold text-neutral-900 mb-4">Stay updated</h3>
                            <p className="text-xs text-neutral-500 mb-4">
                                Get the latest tips on pet care and adoption updates.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-neutral-50 border border-neutral-200 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
                                />
                                <button className="bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-800 transition-all">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-neutral-400 text-xs">© 2026 PetEase. All rights reserved.</p>
                        <div className="flex gap-6">
                            {/* Social placeholders */}
                            <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors"><span className="sr-only">Facebook</span>FB</a>
                            <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors"><span className="sr-only">Twitter</span>TW</a>
                            <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors"><span className="sr-only">Instagram</span>IG</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
