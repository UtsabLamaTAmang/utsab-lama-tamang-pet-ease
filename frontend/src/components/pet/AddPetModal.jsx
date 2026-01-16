import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, MapPin } from "lucide-react";
import { petAPI, uploadAPI } from "@/services/api";
import toast from "react-hot-toast";

export default function AddPetModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [isFree, setIsFree] = useState(true);
    const [locLoading, setLocLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        species: "",
        breed: "",
        age: "",
        gender: "",
        description: "",
        images: [],
        adoptionFee: 0,
        size: "",
        color: "",
        healthStatus: "",
        vaccinated: false,
        neutered: false,
        address: "",
        latitude: null,
        longitude: null
    });
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLocation = () => {
        setLocLoading(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLocLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Reverse geocode to get address (simple mock for now, or use API if key available)
                // For now we set Lat/Lng and a placeholder or approximate address

                try {
                    // Try to fetch address from OpenStreetMap (Free)
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    setFormData(prev => ({
                        ...prev,
                        latitude,
                        longitude,
                        address: data.display_name || `${latitude}, ${longitude}`
                    }));
                    toast.success("Location fetched!");
                } catch (error) {
                    setFormData(prev => ({
                        ...prev,
                        latitude,
                        longitude,
                        address: `${latitude}, ${longitude}`
                    }));
                    toast.success("Location coordinates fetched.");
                } finally {
                    setLocLoading(false);
                }
            },
            (error) => {
                console.error(error);
                toast.error("Unable to retrieve your location");
                setLocLoading(false);
            }
        );
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...files]
            }));

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setPreviewUrls((prev) => {
            // Revoke URL to avoid memory leak
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.images.length < 3) {
            toast.error("Please upload at least 3 images of the pet.");
            return;
        }

        if (!formData.address) {
            toast.error("Please provide a location/address.");
            return;
        }

        setLoading(true);

        try {
            const uploadData = new FormData();
            formData.images.forEach((file) => {
                uploadData.append("images", file);
            });

            const uploadRes = await uploadAPI.uploadMultiple(uploadData);
            const imageUrls = uploadRes.filePaths;

            const petData = {
                name: formData.name,
                species: formData.species,
                breed: formData.breed,
                age: formData.age,
                gender: formData.gender,
                description: formData.description,
                images: imageUrls,
                adoptionFee: isFree ? 0 : parseInt(formData.adoptionFee),
                size: formData.size,
                color: formData.color,
                healthStatus: formData.healthStatus,
                vaccinated: formData.vaccinated,
                neutered: formData.neutered,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude
            };

            await petAPI.create(petData);
            toast.success("Pet submitted for approval!");
            if (onSuccess) onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: "",
                species: "",
                breed: "",
                age: "",
                gender: "",
                description: "",
                images: [],
                adoptionFee: 0,
                size: "",
                color: "",
                healthStatus: "",
                vaccinated: false,
                neutered: false,
                address: "",
                latitude: null,
                longitude: null
            });
            setPreviewUrls([]);
            setIsFree(true);
        } catch (error) {
            console.error("Error adding pet:", error);
            toast.error(error.response?.data?.message || "Failed to add pet");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary-900">Add a Pet</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Pet Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Max"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Age (Years) *</Label>
                            <Input
                                id="age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="e.g. 2"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Location *</Label>
                        <div className="flex gap-2">
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="City, Area or Full Address"
                                required
                            />
                            <Button type="button" variant="outline" onClick={handleLocation} disabled={locLoading}>
                                {locLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size">Size</Label>
                            <Select
                                value={formData.size}
                                onValueChange={(value) => handleSelectChange("size", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Small">Small (0-10kg)</SelectItem>
                                    <SelectItem value="Medium">Medium (10-25kg)</SelectItem>
                                    <SelectItem value="Large">Large (25kg+)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Input
                                id="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="e.g. Brown"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 space-y-3">
                        <Label>Adoption Fee</Label>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant={!isFree ? "outline" : "default"}
                                onClick={() => { setIsFree(true); setFormData(p => ({ ...p, adoptionFee: 0 })); }}
                                className="w-24"
                            >
                                Free
                            </Button>
                            <Button
                                type="button"
                                variant={isFree ? "outline" : "default"}
                                onClick={() => setIsFree(false)}
                                className="w-24"
                            >
                                Price
                            </Button>
                            {!isFree && (
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        name="adoptionFee"
                                        placeholder="Enter Amount (Rs.)"
                                        value={formData.adoptionFee}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                            <input
                                type="checkbox"
                                id="vaccinated"
                                name="vaccinated"
                                checked={formData.vaccinated}
                                onChange={handleChange}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="vaccinated">Vaccinated</Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                            <input
                                type="checkbox"
                                id="neutered"
                                name="neutered"
                                checked={formData.neutered}
                                onChange={handleChange}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="neutered">Neutered/Spayed</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="healthStatus">Health Status</Label>
                        <Input
                            id="healthStatus"
                            name="healthStatus"
                            value={formData.healthStatus}
                            onChange={handleChange}
                            placeholder="e.g. Healthy, Needs special care..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="species">Species *</Label>
                            <Select
                                value={formData.species}
                                onValueChange={(value) => handleSelectChange("species", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select species" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dog">Dog</SelectItem>
                                    <SelectItem value="Cat">Cat</SelectItem>
                                    <SelectItem value="Bird">Bird</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => handleSelectChange("gender", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="breed">Breed *</Label>
                        <Input
                            id="breed"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            placeholder="e.g. Labrador Retriever"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell us about the pet..."
                            className="h-24"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Pet Photos (Min 3) *</Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload images</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>

                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img
                                            src={url}
                                            alt={`Preview ${index}`}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 w-6 h-6 flex items-center justify-center"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {formData.images.length} images selected. At least 3 required.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Add Pet"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
