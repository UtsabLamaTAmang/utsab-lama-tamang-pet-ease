import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin } from "lucide-react";

export default function AdoptionForm({ onSuccess, onCancel }) {
    const queryClient = useQueryClient();
    const [location, setLocation] = useState(null);
    const [fetchingLoc, setFetchingLoc] = useState(false);
    const [isFree, setIsFree] = useState(true);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    const fetchLocation = () => {
        setFetchingLoc(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await res.json();

                        setValue("location", data.display_name); // Backward compat if needed, but mainly address
                        setValue("latitude", lat);
                        setValue("longitude", lng);
                        setValue("address", data.display_name);

                        setLocation({ lat, lng, address: data.display_name });
                    } catch (err) {
                        console.error("Geocoding failed", err);
                        setValue("latitude", lat);
                        setValue("longitude", lng);
                    } finally {
                        setFetchingLoc(false);
                    }
                },
                (error) => {
                    console.error("Location error", error);
                    setFetchingLoc(false);
                    alert("Could not get location.");
                }
            );
        } else {
            setFetchingLoc(false);
            alert("Geolocation not supported");
        }
    };

    const mutation = useMutation({
        mutationFn: async (data) => {
            const token = localStorage.getItem("token");
            return axios.post("http://localhost:5000/api/pets", { ...data, images: [] }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pets']);
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to list pet: " + (error.response?.data?.message || error.message));
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Pet Name *</Label>
                    <Input id="name" {...register("name", { required: true })} placeholder="e.g. Max" />
                    {errors.name && <span className="text-red-500 text-xs">Required</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="age">Age (Years) *</Label>
                    <Input id="age" type="number" {...register("age", { required: true })} placeholder="e.g. 2" />
                    {errors.age && <span className="text-red-500 text-xs">Required</span>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Species *</Label>
                    <Select onValueChange={(val) => setValue("species", val)}>
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
                    <Label htmlFor="breed">Breed *</Label>
                    <Input id="breed" {...register("breed", { required: true })} placeholder="e.g. Golden Retriever" />
                    {errors.breed && <span className="text-red-500 text-xs">Required</span>}
                </div>
            </div>

            {/* Location Section */}
            <div className="space-y-2 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    Location *
                </Label>
                <div className="flex gap-2">
                    <Input
                        {...register("address", { required: true })}
                        placeholder="Enter address or use auto-detect"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={fetchLocation}
                        disabled={fetchingLoc}
                    >
                        {fetchingLoc ? <Loader2 className="animate-spin w-4 h-4" /> : "Detect"}
                    </Button>
                </div>
                {location && <p className="text-xs text-green-600">Detected: {location.address}</p>}
                <input type="hidden" {...register("latitude")} />
                <input type="hidden" {...register("longitude")} />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Tell us about the pet..."
                    className="h-24"
                />
            </div>

            {/* Checkboxes & Fee */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <Checkbox id="vaccinated" onCheckedChange={(checked) => setValue("vaccinated", checked)} />
                        <Label htmlFor="vaccinated" className="cursor-pointer">Vaccinated</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="neutered" onCheckedChange={(checked) => setValue("neutered", checked)} />
                        <Label htmlFor="neutered" className="cursor-pointer">Neutered/Spayed</Label>
                    </div>
                </div>

                <div className="space-y-4 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                    <Label>Adoption Fee</Label>
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant={!isFree ? "outline" : "default"}
                            onClick={() => { setIsFree(true); setValue("adoptionFee", 0); }}
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
                                    placeholder="Enter Amount (Rs.)"
                                    {...register("adoptionFee")}
                                    min="0"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Attributes */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Size</Label>
                        <Select onValueChange={(val) => setValue("size", val)}>
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
                        <Input id="color" {...register("color")} placeholder="e.g. Brown, White..." />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="healthStatus">Health Status / Special Needs</Label>
                    <Input id="healthStatus" {...register("healthStatus")} placeholder="e.g. Healthy, Needs daily medication..." />
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    List Pet
                </Button>
            </div>
        </form>
    );
}
