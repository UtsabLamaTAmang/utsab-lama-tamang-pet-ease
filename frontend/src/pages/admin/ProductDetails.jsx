import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function AdminProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedImage, setSelectedImage] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const { data: product, isLoading, isError, refetch } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await api.get(`/store/products/${id}`);
            return res.data.data;
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.put(`/store/products/${id}`, data, {
                headers: { "Content-Type": undefined } // Let browser set boundary
            });
            return response.data;
        },
        onSuccess: () => {
            refetch(); // Refresh data
            queryClient.invalidateQueries(['products']); // Refresh list
            setIsEditModalOpen(false);
            setSubmitLoading(false);
        },
        onError: () => setSubmitLoading(false)
    });

    const deleteProductMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/store/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            navigate('/admin/products');
        }
    });

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="w-6 h-6 animate-spin text-neutral-900" /></div>;
    }

    if (isError || !product) {
        return <div className="h-screen flex items-center justify-center text-neutral-500">Product not found</div>;
    }

    const images = product.images && product.images.length > 0
        ? product.images.map(img => `http://localhost:5000${img}`)
        : null;

    const nextImage = () => images && setSelectedImage((prev) => (prev + 1) % images.length);
    const prevImage = () => images && setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

    const handleEditSubmit = (formData) => {
        setSubmitLoading(true);
        updateProductMutation.mutate(formData);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteProductMutation.mutate();
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white pb-20">
            {/* Minimal Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-neutral-600 -ml-2 text-neutral-900 font-medium" onClick={() => navigate('/admin/products')}>
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Products
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Delete
                        </Button>
                        <Button size="sm" onClick={() => setIsEditModalOpen(true)} className="bg-black text-white hover:bg-neutral-800 rounded-full px-6">
                            Edit
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* Left: Gallery (Sticky-ish) */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                        <div className="relative aspect-square flex items-center justify-center bg-neutral-50 rounded-none md:rounded-3xl overflow-hidden group">
                            {images ? (
                                <>
                                    <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-8" />
                                    {images.length > 1 && (
                                        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
                                            <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"><ChevronRight className="w-5 h-5" /></button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-neutral-300 flex flex-col items-center"><ShoppingBag className="w-12 h-12 mb-2" />No Image</div>
                            )}
                        </div>
                        {images && images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 flex-shrink-0 bg-neutral-50 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-black' : 'border-transparent hover:border-neutral-200'}`}
                                    >
                                        <img src={img} className="w-full h-full object-contain p-2 mix-blend-multiply" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info (Scrollable) */}
                    <div className="flex flex-col space-y-10 lg:pt-8">
                        {/* Title & Price */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-medium text-neutral-900">Rs. {product.price}</span>
                                <Badge variant="secondary" className="text-sm font-normal px-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-100">
                                    {product.category}
                                </Badge>
                                <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-neutral-100 w-full" />

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Description</h3>
                            <div className="prose prose-lg prose-neutral text-neutral-600 leading-relaxed max-w-none">
                                {product.description ? (
                                    product.description.split('\n').map((para, i) => <p key={i}>{para}</p>)
                                ) : (
                                    <p className="text-neutral-400 italic">No description added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Additional Specs (Cleaner List) */}
                        <div className="space-y-4 pt-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Product Details</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div className="border-t border-neutral-100 pt-3">
                                    <dt className="text-neutral-500 mb-1">Stock Keeping Unit</dt>
                                    <dd className="font-medium text-neutral-900">#{String(product.id)}</dd>
                                </div>
                                <div className="border-t border-neutral-100 pt-3">
                                    <dt className="text-neutral-500 mb-1">Date Added</dt>
                                    <dd className="font-medium text-neutral-900">{new Date(product.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white max-h-[90vh]">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        <ProductForm
                            initialData={product}
                            onSubmit={handleEditSubmit}
                            isLoading={submitLoading}
                            onCancel={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
