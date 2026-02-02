import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Box, Tag, FileText, Edit, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductDetailsModal({ product, open, onOpenChange, onEdit, onDelete }) {
    if (!product) return null;

    const baseURL = "http://localhost:5000";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-hidden p-0 gap-0 bg-neutral-50 border-none shadow-2xl">
                {/* Header Section */}
                <div className="bg-white px-8 py-6 border-b z-10 flex-shrink-0">
                    <DialogHeader>
                        <div className="flex items-start gap-6">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                                {product.images && product.images.length > 0 ? (
                                    <div className="relative">
                                        <img
                                            src={`${baseURL}${product.images[0]}`}
                                            alt={product.name}
                                            className="w-32 h-32 object-cover rounded-xl border-2 border-white shadow-lg ring-1 ring-neutral-200"
                                        />
                                        {product.images.length > 1 && (
                                            <div className="absolute -bottom-2 -right-2 bg-neutral-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                                                +{product.images.length - 1}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-neutral-100 rounded-xl flex items-center justify-center border-2 border-white shadow-lg ring-1 ring-neutral-200">
                                        <Package className="w-16 h-16 text-neutral-400" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <DialogTitle className="text-2xl font-bold text-neutral-900 leading-tight">
                                            {product.name}
                                        </DialogTitle>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="secondary" className="font-normal">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {product.category}
                                            </Badge>
                                            <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className="font-normal">
                                                <Box className="w-3 h-3 mr-1" />
                                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex-shrink-0 text-right">
                                        <div className="text-sm text-neutral-500 font-medium">Price</div>
                                        <div className="text-3xl font-bold text-primary-600">Rs. {product.price}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-8">
                    <div className="space-y-6">
                        {/* Description Section */}
                        {product.description && (
                            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                                <h3 className="font-semibold text-neutral-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-3">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    Description
                                </h3>
                                <p className="text-neutral-700 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Product Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard
                                icon={DollarSign}
                                label="Unit Price"
                                value={`Rs. ${product.price}`}
                                iconColor="text-green-600"
                                iconBg="bg-green-50"
                            />
                            <InfoCard
                                icon={Box}
                                label="Available Stock"
                                value={`${product.stock} units`}
                                iconColor="text-blue-600"
                                iconBg="bg-blue-50"
                            />
                            <InfoCard
                                icon={Tag}
                                label="Category"
                                value={product.category}
                                iconColor="text-purple-600"
                                iconBg="bg-purple-50"
                            />
                            <InfoCard
                                icon={Package}
                                label="Product ID"
                                value={`#${product.id}`}
                                iconColor="text-neutral-600"
                                iconBg="bg-neutral-50"
                            />
                        </div>

                        {/* Metadata */}
                        <div className="bg-neutral-100 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-neutral-500">Created:</span>
                                    <span className="ml-2 text-neutral-900 font-medium">
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-500">Last Updated:</span>
                                    <span className="ml-2 text-neutral-900 font-medium">
                                        {new Date(product.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="bg-white p-4 border-t flex justify-between items-center flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="ghost" asChild>
                            <Link to={`/product/${product.id}`} target="_blank">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Page
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                onEdit(product);
                                onOpenChange(false);
                            }}
                            className="gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Product
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                    onDelete(product);
                                    onOpenChange(false);
                                }
                            }}
                            className="gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Info Card Component
const InfoCard = ({ icon: Icon, label, value, iconColor, iconBg }) => (
    <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-semibold text-neutral-900 truncate">{value}</p>
            </div>
        </div>
    </div>
);
