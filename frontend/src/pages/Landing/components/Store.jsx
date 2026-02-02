import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Star } from "lucide-react";

export default function Store() {
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

    const products = [
        {
            name: "Premium Dog Food",
            price: "Rs. 2500",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1619980294942-46f3c8d8e1ce?auto=format&fit=crop&w=800&q=80",
        },
        {
            name: "Cat Scratching Post",
            price: "Rs. 1500",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800&q=80",
        },
        {
            name: "Pet Carrier",
            price: "Rs. 2000",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1596854747084-1ffde6f2d28c?auto=format&fit=crop&w=800&q=80",
        },
        {
            name: "Interactive Toy Set",
            price: "Rs. 1200",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1619980296991-5c5a5f96365e?auto=format&fit=crop&w=800&q=80",
        },
    ];

    return (
        <section
            id="store"
            ref={sectionRef}
            className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
        >
            <div className="max-w-7xl mx-auto w-full py-16">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 text-center md:text-left">
                    <div className="max-w-2xl mx-auto md:mx-0">
                        <p className="text-sm font-semibold text-secondary-700 mb-2">STORE</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900">
                            Essentials that don&apos;t feel like guesswork.
                        </h2>
                        <p className="text-base text-neutral-600 mt-4 max-w-2xl">
                            Products are curated, reviewed, and tagged by real pet parents—so you can skip the overwhelm and choose with confidence.
                        </p>
                    </div>
                    <button className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-800 cursor-pointer">
                        Browse all products
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <div
                            key={product.name}
                            className="rounded-2xl bg-neutral-50 border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-secondary-200 transition-all duration-300 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="h-44 w-full">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[...Array(5)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className={`w-3 h-3 ${j < Math.floor(product.rating) ? "fill-current" : "text-neutral-200"}`}
                                        />
                                    ))}
                                    <span className="text-xs text-neutral-500 ml-1">{product.rating}</span>
                                </div>
                                <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold text-secondary-700">{product.price}</span>
                                    <button className="text-xs cursor-pointer font-semibold px-3 py-2 rounded-full bg-secondary-600 text-white hover:bg-secondary-700">
                                        Add to cart
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
