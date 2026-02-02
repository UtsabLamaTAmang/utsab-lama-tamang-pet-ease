import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
    { id: "services", label: "Services" },
    { id: "adoption", label: "Adoption" },
    { id: "store", label: "Store" },
    { id: "vets", label: "Vets" },
];

export default function Navbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-200 ${scrolled
                    ? "bg-white/95 backdrop-blur border-b border-neutral-200 shadow-sm"
                    : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="cursor-pointer" onClick={() => navigate("/")}>
                        <Logo size="default" showText={true} />
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate("/login")}>
                            Sign In
                        </Button>
                        <Button onClick={() => navigate("/signup")}>Get Started</Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="md:hidden p-2 rounded-full hover:bg-neutral-100 transition"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-neutral-200 bg-white shadow-lg animate-slide-up">
                    <div className="px-4 py-3 space-y-2">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="block text-sm font-medium text-neutral-700 hover:text-primary-600 py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                        <div className="pt-4 flex flex-col gap-2">
                            <Button variant="outline" className="w-full justify-center" onClick={() => navigate("/login")}>
                                Sign In
                            </Button>
                            <Button className="w-full justify-center" onClick={() => navigate("/signup")}>
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
