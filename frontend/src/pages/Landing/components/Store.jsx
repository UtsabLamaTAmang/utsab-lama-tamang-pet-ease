import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, Star, ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

export default function Store() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/store/products", { params: { limit: 4 } });
                const data = response.data?.products || response.data?.data || response.data;
                if (Array.isArray(data) && data.length > 0) {
                    setProducts(data.slice(0, 4));
                } else {
                    setProducts(fallbackProducts);
                }
            } catch (error) {
                setProducts(fallbackProducts);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const fallbackProducts = [
        {
            id: 1,
            name: "Premium Dog Food",
            price: 2500,
            rating: 4.8,
            images: ["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80"],
        },
        {
            id: 2,
            name: "Cat Scratching Post",
            price: 1500,
            rating: 4.9,
            images: ["https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=800&q=80"],
        },
        {
            id: 3,
            name: "Pet Carrier Bag",
            price: 2000,
            rating: 4.7,
            images: ["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80"],
        },
        {
            id: 4,
            name: "Interactive Toy Set",
            price: 1200,
            rating: 4.6,
            images: ["https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=80"],
        },
    ];

    const displayProducts = products.length > 0 ? products : fallbackProducts;

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const img = product.images[0];
            if (img.startsWith("http")) return img;
            return `http://localhost:5000${img}`;
        }
        if (product.image) {
            if (product.image.startsWith("http")) return product.image;
            return `http://localhost:5000${product.image}`;
        }
        return "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80";
    };

    const getPrice = (product) => {
        const price = product.price || 0;
        return `Rs. ${price.toLocaleString()}`;
    };

    const getRating = (product) => {
        return product.rating || product.averageRating || 4.5;
    };

    return (
        <section
            id="store"
            ref={sectionRef}
            className="relative px-4 sm:px-6 lg:px-8 py-20 overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)",
            }}
        >
            <div
                className={`max-w-7xl mx-auto w-full transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 text-center md:text-left">
                    <div className="max-w-2xl mx-auto md:mx-0">
                        <p className="text-sm font-bold text-secondary-600 tracking-widest mb-3">STORE</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                            Essentials that don&apos;t feel like guesswork.
                        </h2>
                        <p className="text-base text-neutral-600 mt-4 max-w-2xl leading-relaxed">
                            Products are curated, reviewed, and tagged by real pet parents—so you can skip the overwhelm and choose with confidence.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/login")}
                        className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-secondary-600 hover:text-secondary-700 hover:gap-3 transition-all duration-300 cursor-pointer"
                    >
                        Browse all products
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {loading
                        ? [...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white border border-neutral-100 overflow-hidden animate-pulse">
                                <div className="h-44 bg-neutral-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                                    <div className="h-9 bg-neutral-200 rounded-xl" />
                                </div>
                            </div>
                        ))
                        : displayProducts.map((product, index) => (
                            <div
                                key={product.id || product.name}
                                className="group rounded-2xl bg-white border border-neutral-100 overflow-hidden hover-lift cursor-pointer transition-all duration-500"
                                onClick={() => navigate("/login")}
                            >
                                <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80";
                                        }}
                                    />
                                    {/* Quick view overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-neutral-800 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <Eye className="w-4 h-4" />
                                            Quick View
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-2.5">
                                    {/* Rating */}
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, j) => (
                                                <Star
                                                    key={j}
                                                    className={`w-3 h-3 ${j < Math.floor(getRating(product))
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-neutral-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-neutral-400 font-medium">{getRating(product)}</span>
                                    </div>

                                    <p className="text-sm font-semibold text-neutral-900 group-hover:text-secondary-700 transition-colors duration-300 line-clamp-1">
                                        {product.name}
                                    </p>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-sm font-bold text-secondary-700">
                                            {getPrice(product)}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate("/login"); }}
                                            className="flex items-center gap-1 text-[11px] cursor-pointer font-semibold px-3 py-2 rounded-xl bg-gradient-to-r from-secondary-600 to-secondary-700 text-white hover:shadow-lg hover:shadow-secondary-600/25 transition-all duration-300 active:scale-95"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {/* Mobile CTA */}
                <div className="md:hidden text-center mt-8">
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-600 cursor-pointer"
                    >
                        Browse all products
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
