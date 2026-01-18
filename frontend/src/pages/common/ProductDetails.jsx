import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ShoppingCart, Heart, Share2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = "http://localhost:5000/api";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedImage, setSelectedImage] = useState(0);

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE_URL}/store/products/${id}`);
            return res.data; // Assuming backend endpoint returns product object directly or inside data
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-2xl font-bold text-neutral-900">Product Not Found</h2>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const images = product.images && product.images.length > 0
        ? product.images.map(img => `http://localhost:5000${img}`)
        : null;

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Button>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image Gallery Section */}
                        <div className="p-6 lg:p-12 bg-neutral-100 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-200">
                            <div className="relative w-full aspect-square max-w-md bg-white rounded-2xl shadow-sm border border-white overflow-hidden mb-6">
                                {images ? (
                                    <img
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                        <p className="text-neutral-400">No image available</p>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images && images.length > 1 && (
                                <div className="flex justify-center gap-4 overflow-x-auto w-full pb-2">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === idx
                                                    ? 'border-primary-600 ring-2 ring-primary-100 shadow-md scale-105'
                                                    : 'border-white hover:border-neutral-300 opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-6 lg:p-12 flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="secondary" className="mb-4">{product.category}</Badge>
                                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">{product.name}</h1>
                                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                                        <span>Product ID: #{product.id}</span>
                                        <span>•</span>
                                        <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="rounded-full">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-b border-neutral-100 py-6">
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-bold text-primary-600">Rs. {product.price}</span>
                                    <span className="text-sm text-neutral-500 mb-2">/ unit</span>
                                </div>
                                <p className="text-sm text-neutral-500">
                                    Includes all applicable taxes. Shipping calculated at checkout.
                                </p>
                            </div>

                            <div className="mt-8 space-y-4 flex-1">
                                <h3 className="font-semibold text-neutral-900 text-lg">Description</h3>
                                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                                    {product.description || "No description provided for this product."}
                                </p>

                                {/* Features or Extra Info placeholders */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Quality Assured</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Secure Payment</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Fast Delivery</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-neutral-100">
                                <div className="flex gap-4">
                                    <div className="w-32">
                                        {/* Quantity input placeholder */}
                                        <div className="flex items-center border border-neutral-200 rounded-lg h-12">
                                            <button className="px-3 h-full hover:bg-neutral-50 rounded-l-lg">-</button>
                                            <input type="text" value="1" className="w-full text-center border-none focus:ring-0 text-neutral-900 font-medium" readOnly />
                                            <button className="px-3 h-full hover:bg-neutral-50 rounded-r-lg">+</button>
                                        </div>
                                    </div>
                                    <Button className="flex-1 h-12 text-lg font-medium gap-2">
                                        <ShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
