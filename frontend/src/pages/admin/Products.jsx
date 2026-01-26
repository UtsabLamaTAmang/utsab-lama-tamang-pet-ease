import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTableData } from '@/hooks/useTableData';
import { DataTable } from '@/components/common/DataTable';
import ProductDetailsModal from '@/components/admin/ProductDetailsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Package, X, Upload, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Fetch function for products
const fetchProducts = async (params) => {
    const { signal, ...queryParams } = params;
    const response = await api.get('/store/products', {
        params: queryParams,
        signal
    });
    return response.data;
};

// Column definitions
const PRODUCT_COLUMNS = [
    {
        header: 'Image',
        accessor: 'images',
        cellClassName: 'w-20',
        cell: (product) => (
            product.images && product.images.length > 0 ? (
                <img
                    src={`http://localhost:5000${product.images[0]}`}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg border bg-white"
                />
            ) : (
                <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-neutral-400" />
                </div>
            )
        )
    },
    {
        header: 'Product Name',
        accessor: 'name',
        cell: (product) => (
            <div>
                <p className="font-medium text-neutral-900">{product.name}</p>
                <p className="text-sm text-neutral-500 line-clamp-1">{product.description}</p>
            </div>
        )
    },
    {
        header: 'Category',
        accessor: 'category',
        cell: (product) => (
            <Badge variant="secondary" className="font-normal">
                {product.category}
            </Badge>
        )
    },
    {
        header: 'Price',
        accessor: 'price',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        cell: (product) => (
            <span className="font-semibold text-neutral-900">Rs. {product.price}</span>
        )
    },
    {
        header: 'Stock',
        accessor: 'stock',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        cell: (product) => (
            <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                {product.stock} units
            </Badge>
        )
    }
];

export default function Products() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Use the table data hook
    const {
        data: products,
        pagination,
        isLoading,
        isFetching,
        search,
        setSearch,
        setPage,
        setLimit,
        setFilter,
        clearFilters,
        refetch
    } = useTableData('products', fetchProducts, {
        initialLimit: 10,
        enableUrlParams: true
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '', price: '', stock: '', category: '', description: '', images: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const fileInputRef = useRef(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const createProductMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post("/store/products", data, {
                headers: { "Content-Type": undefined }
            });
            return response.data;
        },
        onSuccess: () => {
            refetch();
            setIsModalOpen(false);
            setSubmitLoading(false);
            resetForm();
        },
        onError: () => setSubmitLoading(false)
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.put(`/store/products/${id}`, data, {
                headers: { "Content-Type": undefined }
            });
            return response.data;
        },
        onSuccess: () => {
            refetch();
            setIsModalOpen(false);
            setSubmitLoading(false);
            resetForm();
        },
        onError: () => setSubmitLoading(false)
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/store/products/${id}`);
            return response.data;
        },
        onSuccess: () => {
            refetch();
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', stock: '', category: '', description: '', images: [] });
        setImagePreviews([]);
        setEditingProduct(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddProduct = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category,
            description: product.description,
            images: [] // Reset images for upload, maybe show existing ones differently?
        });
        // For now, just show existing specific ones if no new ones, but file input handles new.
        // Handling existing images in edit + adding new ones is complex. 
        // Logic: if new images uploaded, they replace/add.
        // For simplicity: We show existing images but clearing them is tricky without ID support.
        // We'll just show existing in preview but distinct.
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (product) => {
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            deleteProductMutation.mutate(product.id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        data.append('description', formData.description);

        formData.images.forEach(file => {
            data.append('images', file);
        });

        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    // Enhanced columns with actions
    const columnsWithActions = [
        ...PRODUCT_COLUMNS,
        {
            header: 'Actions',
            accessor: 'actions',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            cell: (product) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                        }}
                        className="h-8 w-8"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product);
                        }}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
                    <p className="text-neutral-500 mt-1">Manage your store inventory</p>
                </div>
                <Button onClick={handleAddProduct} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedCategory || undefined} onValueChange={(val) => {
                    setSelectedCategory(val);
                    setFilter('category', val);
                }}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Toys">Toys</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Medicine">Medicine</SelectItem>
                        <SelectItem value="Grooming">Grooming</SelectItem>
                    </SelectContent>
                </Select>
                {(search || selectedCategory) && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearch('');
                            setSelectedCategory('');
                            clearFilters();
                        }}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Table */}
            <DataTable
                columns={columnsWithActions}
                data={products}
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onRowClick={(product) => {
                    navigate(`/admin/products/${product.id}`);
                }}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="No products found"
            />

            {/* Product Details Modal */}
            {viewingProduct && (
                <ProductDetailsModal
                    product={viewingProduct}
                    open={isViewModalOpen}
                    onOpenChange={setIsViewModalOpen}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                />
            )}

            {/* Product Modal */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-[95vw] md:max-w-6xl p-0 gap-0 overflow-hidden bg-white">
                    <div className="p-6 border-b bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-neutral-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </DialogTitle>
                            <p className="text-sm text-neutral-500 mt-1">
                                {editingProduct ? 'Update the product details below.' : 'Fill in the information to create a new product listing.'}
                            </p>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-100px)]">
                        <div className="flex-1 overflow-y-auto p-8 md:p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Left Column: Core Details */}
                                <div className="lg:col-span-7 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-primary-600" />
                                            Core Details
                                        </h3>

                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Product Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="e.g. Royal Canin Puppy Food"
                                                    className="h-11 bg-white border-neutral-200 focus-visible:ring-0 focus-visible:border-primary-600 rounded-lg shadow-sm font-medium"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="category" className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Category</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                                    required
                                                >
                                                    <SelectTrigger className="h-11 bg-white border-neutral-200 focus:ring-0 focus:border-primary-600 rounded-lg shadow-sm">
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Food">Food</SelectItem>
                                                        <SelectItem value="Toys">Toys</SelectItem>
                                                        <SelectItem value="Accessories">Accessories</SelectItem>
                                                        <SelectItem value="Medicine">Medicine</SelectItem>
                                                        <SelectItem value="Grooming">Grooming</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="stock" className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Stock Unit</Label>
                                                <Input
                                                    id="stock"
                                                    name="stock"
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    placeholder="0"
                                                    className="h-11 bg-white border-neutral-200 focus-visible:ring-0 focus-visible:border-primary-600 rounded-lg shadow-sm"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="price" className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Price (Rs.)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">Rs.</span>
                                                    <Input
                                                        id="price"
                                                        name="price"
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={handleInputChange}
                                                        required
                                                        min="0"
                                                        placeholder="0.00"
                                                        className="h-11 pl-10 bg-white border-neutral-200 focus-visible:ring-0 focus-visible:border-primary-600 rounded-lg shadow-sm font-medium text-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows={5}
                                                    placeholder="Describe the product features, ingredients, etc..."
                                                    className="bg-white border-neutral-200 focus-visible:ring-0 focus-visible:border-primary-600 rounded-lg shadow-sm resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Media */}
                                <div className="lg:col-span-5 space-y-8">
                                    <h3 className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-primary-600" />
                                        Media Gallery
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="group relative border-2 border-dashed border-neutral-200 hover:border-primary-500 hover:bg-neutral-50 rounded-2xl p-10 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer">
                                            <Input
                                                id="images"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                ref={fileInputRef}
                                            />
                                            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm border border-primary-100">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-neutral-900">Upload Images</h4>
                                            <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">
                                                Drag & drop or click to browse. Support JPG, PNG, WEBP.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Product Images ({imagePreviews.length})</span>
                                                {imagePreviews.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImagePreviews([]);
                                                            setFormData(prev => ({ ...prev, images: [] }));
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-600"
                                                    >
                                                        Clear All
                                                    </button>
                                                )}
                                            </div>

                                            {imagePreviews.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {imagePreviews.map((src, index) => (
                                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group bg-white shadow-sm">
                                                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(index)}
                                                                    className="bg-white text-red-500 rounded-full p-2 hover:bg-red-50 transition-colors transform hover:scale-110"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            {index === 0 && (
                                                                <div className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                    Main
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="border border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-neutral-50/50">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                                        <ImageIcon className="w-5 h-5 text-neutral-300" />
                                                    </div>
                                                    <p className="text-sm text-neutral-500">No images selected</p>
                                                    {editingProduct && (
                                                        <p className="text-xs text-neutral-400 mt-1 bg-white px-2 py-1 rounded border">Existing images will be replaced</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t bg-white p-6 flex justify-end gap-3 z-10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="h-11 px-6 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitLoading}
                                className="h-11 px-8 bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20 hover:shadow-lg transition-all"
                            >
                                {submitLoading ? (editingProduct ? 'Saving Check...' : 'Creating...') : (editingProduct ? 'Save Changes' : 'Create Product')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
