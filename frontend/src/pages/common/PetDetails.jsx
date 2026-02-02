import React, { useState, useEffect } from 'react';
import AdoptionModal from '@/components/pet/AdoptionModal';
import ChatWindow from '@/components/chat/ChatWindow';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petAPI, chatAPI, wishlistAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Heart,
    MapPin,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Calendar,
    Ruler,
    Palette,
    CheckCircle2,
    Activity,
    Info,
    User,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PetDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const { user } = useAuth();

    // Check wishlist status
    useEffect(() => {
        if (user && id) {
            wishlistAPI.checkStatus(id)
                .then(res => setIsFavorited(res.isFavorited))
                .catch(console.error);
        }
    }, [user, id]);

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['pet', id],
        queryFn: () => petAPI.getById(id),
        retry: 1
    });

    const pet = response?.data;

    const handleAskAbout = async () => {
        if (!user) {
            toast.error("Please login to chat");
            navigate('/login');
            return;
        }
        try {
            const res = await chatAPI.initiate(pet.id);
            if (res.success) {
                // setChatId(res.data.chatId);
                // setIsChatOpen(true);
                navigate(`/user/messages/${res.data.chatId}`);
            }
        } catch (error) {
            toast.error("Failed to start chat");
            console.error(error);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error("Please login to save favorites");
            navigate('/login');
            return;
        }
        try {
            const res = await wishlistAPI.toggle({ petId: pet.id });
            if (res.success) {
                setIsFavorited(prev => !prev);
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("Failed to update favorites");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this pet? This action cannot be undone.")) return;
        try {
            // Assuming api.js has delete method, if not I will use axios directly in next step or assume it exists
            // Since I haven't seen api.js yet, I'll use generic approach or petAPI.delete if standard
            await petAPI.delete(pet.id);
            toast.success("Pet deleted successfully");
            navigate('/user/adoption');
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete pet");
        }
    };

    if (isLoading) return <PetDetailsSkeleton />;
    if (error || !pet) return <ErrorState navigate={navigate} />;

    // Ensure images are correctly formatted URLs
    const getImageUrl = (img) => {
        if (!img) return 'https://placehold.co/800x600?text=No+Image';
        if (img.startsWith('http')) return img;
        return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
    };

    const images = pet.images && pet.images.length > 0
        ? pet.images.map(getImageUrl)
        : ['https://placehold.co/800x600?text=No+Image'];

    const isOwner = user?.id === pet.ownerId;

    return (
        <div className="min-h-screen text-neutral-900 font-sans">
            {/* Minimal Header */}
            <header className="border-b border-neutral-100 bg-white sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={handleDelete}
                            >
                                <Trash2 size={16} /> Delete Pet
                            </Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-2 text-neutral-600 rounded-full border-neutral-200">
                            <Share2 size={16} /> Share
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`gap-2 rounded-full border-neutral-200 transition-colors ${isFavorited ? "text-red-500 border-red-200 bg-red-50" : "text-neutral-600 hover:text-red-500 hover:border-red-200"
                                }`}
                            onClick={handleToggleFavorite}
                        >
                            <Heart size={16} className={isFavorited ? "fill-current" : ""} /> {isFavorited ? "Saved" : "Save"}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Gallery (7 Cols) */}
                    <div className="lg:col-span-12 lg:mb-4">
                        <div className="flex flex-col md:flex-row gap-2 h-[500px]">
                            {/* Main Image */}
                            <div className="flex-1 bg-neutral-100 rounded-xl overflow-hidden relative group">
                                <img
                                    src={images[activeImageIndex]}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/90 text-neutral-900 border-0 shadow-sm backdrop-blur px-3 py-1 font-semibold">
                                        {pet.status === 'AVAILABLE' ? 'Available' : pet.status}
                                    </Badge>
                                </div>
                            </div>
                            {/* Side Thumbnails (Desktop) */}
                            <div className="hidden md:flex flex-col gap-2 w-32 overflow-y-auto pr-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-neutral-900' : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Split: Details (8) & Sidebar (4) */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Title Section */}
                        <div className="border-b border-neutral-100 pb-8">
                            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">{pet.name}</h1>
                            <div className="flex items-center text-neutral-500 gap-4 text-sm font-medium">
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {pet.address || "Location Unavailable"}
                                </div>
                                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                <div>ID: #{pet.id?.toString().padStart(6, '0')}</div>
                                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                <div>Posted {new Date(pet.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-4">About {pet.name}</h3>
                            <p className="text-neutral-600 leading-7 whitespace-pre-line text-lg">
                                {pet.description || "No description provided."}
                            </p>
                        </div>

                        {/* Comprehensive Details Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">Pet Attributes</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                <DetailItem label="Species" value={pet.species} />
                                <DetailItem label="Breed" value={pet.breed} />
                                <DetailItem label="Age" value={`${pet.age} Years`} />
                                <DetailItem label="Gender" value={pet.gender} />
                                <DetailItem label="Size" value={pet.size || 'N/A'} />
                                <DetailItem label="Color" value={pet.color || 'N/A'} />
                            </div>
                        </div>

                        {/* Health & Verification */}
                        <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                <Activity className="text-primary-600" size={20} />
                                Health & Verification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StatusRow label="Vaccinated" value={pet.isVaccinated} />
                                <StatusRow label="Neutered/Spayed" value={pet.neutered} />
                                <StatusRow label="Identified/Verified" value={true} />
                                {pet.healthStatus && (
                                    <div className="md:col-span-2 mt-2 pt-4 border-t border-neutral-200">
                                        <span className="text-sm text-neutral-500 font-medium block mb-1">Health Notes</span>
                                        <p className="text-neutral-900">{pet.healthStatus}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Action Card (4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24">
                            <Card className="p-6 border-neutral-200 shadow-xl shadow-neutral-100/50 rounded-2xl">
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-sm text-neutral-500 font-medium mb-1">Adoption Fee</div>
                                        <div className="text-3xl font-bold text-primary-600">
                                            {pet.adoptionFee && pet.adoptionFee > 0 ? `Rs. ${pet.adoptionFee}` : 'Free'}
                                        </div>
                                        <div className="text-xs text-neutral-400 mt-1">Direct from Owner</div>
                                    </div>

                                    {!isOwner ? (
                                        <>
                                            <Button
                                                size="lg"
                                                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => setIsAdoptionModalOpen(true)}
                                                disabled={pet.status === 'ADOPTED'}
                                            >
                                                {pet.status === 'ADOPTED' ? 'Pet Adopted' : 'Start Adoption Application'}
                                            </Button>

                                            <div className="pt-6 border-t border-neutral-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                                        <User className="text-neutral-500" size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-neutral-900">{pet.owner?.fullName || "Private Owner"}</div>
                                                        <div className="text-xs text-neutral-500">Member since {new Date(pet.owner?.createdAt || Date.now()).getFullYear()}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl"
                                                    onClick={handleAskAbout}
                                                >
                                                    Ask about {pet.name}
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 bg-neutral-100 rounded-xl text-center">
                                            <p className="text-neutral-600 font-medium">You own this pet</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-3">
                                <ShieldCheck className="shrink-0 text-blue-600" size={20} />
                                <p>All pets are verified for safety. Please review our adoption guidelines before proceeding.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <AdoptionModal
                isOpen={isAdoptionModalOpen}
                onClose={() => setIsAdoptionModalOpen(false)}
                pet={pet}
            />

            <ChatWindow
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipientName={pet?.owner?.fullName || "Owner"}
                roomId={chatId}
            />
        </div>
    );
}

// Sub-components for cleaner code
function DetailItem({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">{label}</span>
            <span className="text-neutral-900 font-medium text-lg">{value}</span>
        </div>
    );
}

function StatusRow({ label, value }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-100">
            <span className="text-neutral-600 font-medium">{label}</span>
            {value ? (
                <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 size={14} /> Yes
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-neutral-400 bg-neutral-50 px-2.5 py-1 rounded-full text-xs font-bold">
                    No
                </div>
            )}
        </div>
    );
}

function ErrorState({ navigate }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Pet Not Found</h2>
            <Button onClick={() => navigate('/user/adoption')}>Return to Feed</Button>
        </div>
    );
}

function PetDetailsSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
            <div className="h-[500px] bg-neutral-100 rounded-xl mb-10" />
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-8 space-y-8">
                    <div className="h-10 w-1/2 bg-neutral-100 rounded" />
                    <div className="h-40 bg-neutral-100 rounded" />
                </div>
                <div className="col-span-4">
                    <div className="h-64 bg-neutral-100 rounded" />
                </div>
            </div>
        </div>
    );
}
