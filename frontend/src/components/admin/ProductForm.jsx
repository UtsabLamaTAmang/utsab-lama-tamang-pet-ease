import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, ImageIcon, Package, X } from 'lucide-react';

export default function ProductForm({ initialData = null, onSubmit, isLoading, onCancel }) {
    const [formData, setFormData] = useState({
        name: '', price: '', stock: '', category: '', description: '', images: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                price: initialData.price ? initialData.price.toString() : '',
                stock: initialData.stock ? initialData.stock.toString() : '',
                category: initialData.category || '',
                description: initialData.description || '',
                images: []
            });
            // Handle existing images
            if (initialData.images && initialData.images.length > 0) {
                setExistingImages(initialData.images);
            }
        }
    }, [initialData]);

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

    const removeNewImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Note: Backend might need specific logic to delete existing images. 
    // For now, we will just display them. If we wanted to delete, we'd need a 'deletedImages' array in state.

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        data.append('description', formData.description);

        formData.images.forEach(file => {
            data.append('images', file);
        });

        // We could explicitly handle existing images retention logic here if the backend supports it,
        // but typically 'images' field updates might replace or add. 
        // Based on previous code, it seems to add or replace. 
        // For this iteration, we assume new uploads append or standard update behavior.

        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Core Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 border-b pb-2">
                                <Package className="w-5 h-5" />
                                Product Information
                            </h3>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Premium Dog Food"
                                        className="h-12"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                            required
                                        >
                                            <SelectTrigger className="h-12">
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
                                        <Label htmlFor="stock">Stock Quantity</Label>
                                        <Input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (Rs.)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">Rs.</span>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            className="h-12 pl-12 text-lg font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="resize-none"
                                        placeholder="Detailed product description..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Media Upload */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 border-b pb-2">
                                <ImageIcon className="w-5 h-5" />
                                Images
                            </h3>

                            <div className="space-y-4">
                                <div className="relative border-2 border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 rounded-xl p-8 text-center transition-all cursor-pointer">
                                    <Input
                                        id="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        ref={fileInputRef}
                                    />
                                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6 text-neutral-500" />
                                    </div>
                                    <p className="text-sm font-medium text-neutral-900">Click to Upload</p>
                                    <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WEBP</p>
                                </div>

                                {/* Preview Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Existing Images (Read-only view for now) */}
                                    {existingImages.map((src, index) => (
                                        <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border bg-neutral-50 opacity-80">
                                            <img src={`http://localhost:5000${src}`} alt="Existing" className="w-full h-full object-cover" />
                                            <div className="absolute top-1 left-1 bg-neutral-900/50 text-white text-[10px] px-1.5 py-0.5 rounded">Saved</div>
                                        </div>
                                    ))}

                                    {/* New Previews */}
                                    {imagePreviews.map((src, index) => (
                                        <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm group">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t p-6 flex justify-end gap-4 bg-neutral-50/50">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading} className="bg-neutral-900 hover:bg-neutral-800 text-white px-8">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
