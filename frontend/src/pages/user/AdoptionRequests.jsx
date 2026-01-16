import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adoptionAPI, userAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Gift, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/100x100?text=No+Image';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
};

export default function AdoptionRequests() {
    return (
        <div className="mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Adoption Applications</h1>
            <p className="text-neutral-500 mb-6 text-sm">Manage your applications and incoming requests.</p>

            <Tabs defaultValue="sent" className="w-full">
                <TabsList className="mb-6 w-fit h-auto p-1 bg-neutral-100 rounded-lg">
                    <TabsTrigger
                        value="sent"
                        className="flex-1 md:w-40 py-1.5 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                        Sent Applications
                    </TabsTrigger>
                    <TabsTrigger
                        value="received"
                        className="flex-1 md:w-40 py-1.5 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                        Received Requests
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sent">
                    <SentRequestsList />
                </TabsContent>

                <TabsContent value="received">
                    <ReceivedRequestsList />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SentRequestsList() {
    const { data: response, isLoading, error } = useQuery({
        queryKey: ['adoption-requests', 'sent'],
        queryFn: () => adoptionAPI.getAll({ type: 'sent' })
    });

    const requests = response?.data || [];

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;
    if (error) return <div className="text-center text-red-500 p-8">Failed to load requests</div>;
    if (requests.length === 0) return <EmptyState type="sent" />;

    return (
        <Card className="border-neutral-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Pet</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                                        <img
                                            src={getImageUrl(request.pet?.imageUrl)}
                                            alt={request.pet?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-medium text-neutral-900">{request.pet?.name || 'Unknown Pet'}</div>
                                        <div className="text-xs text-neutral-500">{request.pet?.breed}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={`${getStatusColor(request.status)} shadow-none border-0`}>
                                    {request.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-neutral-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <p className="text-sm text-neutral-600 truncate max-w-[200px]" title={request.reason}>
                                    {request.reason}
                                </p>
                            </TableCell>
                            <TableCell className="text-right">
                                {request.status === 'PENDING' && (
                                    <CancelRequestButton id={request.id} />
                                )}
                                {request.status === 'APPROVED' && (
                                    <span className="text-sm text-green-600 font-medium">Owner Approved</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

function ReceivedRequestsList() {
    const queryClient = useQueryClient();
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['adoption-requests', 'received'],
        queryFn: () => adoptionAPI.getAll({ type: 'received' })
    });

    const requests = response?.data || [];

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, notes }) => adoptionAPI.updateStatus(id, status, notes),
        onSuccess: () => {
            queryClient.invalidateQueries(['adoption-requests', 'received']);
            toast.success("Request updated");
        },
        onError: () => toast.error("Failed to update request")
    });

    const handleAction = (id, status) => {
        const notes = status === 'REJECTED' ? prompt("Reason for rejection (optional):") : '';
        if (status === 'REJECTED' && notes === null) return;
        updateStatusMutation.mutate({ id, status, notes });
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;
    if (error) return <div className="text-center text-red-500 p-8">Failed to load requests</div>;
    if (requests.length === 0) return <EmptyState type="received" />;

    return (
        <>
            <Card className="border-neutral-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Pet</TableHead>
                            <TableHead className="w-[200px]">Applicant</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
                                            <img
                                                src={getImageUrl(request.pet?.imageUrl)}
                                                alt={request.pet?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="font-medium text-neutral-900">{request.pet?.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-neutral-900">{request.user?.fullName}</div>
                                        <button
                                            className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                                            onClick={() => setSelectedApplicant(request.user)}
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-sm"><span className="text-xs text-neutral-400 uppercase font-bold">Reason:</span> {request.reason}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${getStatusColor(request.status)} shadow-none border-0`}>
                                        {request.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {request.chat && (
                                        <Link to={`/user/chat/${request.chat.id}`}>
                                            <Button variant="ghost" size="sm" className="mr-2 h-8 px-2 text-primary-600">Chat</Button>
                                        </Link>
                                    )}
                                    {request.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                                onClick={() => handleAction(request.id, 'REJECTED')}
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                                onClick={() => handleAction(request.id, 'APPROVED')}
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                    {request.status === 'APPROVED' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 border-primary-200 text-primary-700 hover:bg-primary-50"
                                            onClick={() => handleAction(request.id, 'COMPLETED')}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            Mark Adopted
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={!!selectedApplicant} onOpenChange={(open) => !open && setSelectedApplicant(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Applicant Details</DialogTitle>
                        <DialogDescription>View user profile and activity statistics.</DialogDescription>
                    </DialogHeader>
                    {selectedApplicant && (
                        <ApplicantDetailsContent user={selectedApplicant} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function ApplicantDetailsContent({ user }) {
    const { data: profile, isLoading } = useQuery({
        queryKey: ['public-profile', user.id],
        queryFn: () => userAPI.getPublicProfile(user.id),
        enabled: !!user.id
    });

    const stats = profile?.data?.stats;

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-8 py-4">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                    <span className="text-3xl font-bold">{user.fullName?.[0]}</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">{user.fullName}</h2>
                    <p className="text-neutral-500">{user.email}</p>
                    {user.phone && <p className="text-neutral-500">{user.phone}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl flex flex-col items-center text-center border border-blue-100">
                    <Heart className="text-blue-500 mb-3 w-8 h-8" />
                    <span className="text-3xl font-bold text-blue-900 mb-1">{stats?.adopted || 0}</span>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pets Adopted</span>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl flex flex-col items-center text-center border border-purple-100">
                    <Gift className="text-purple-500 mb-3 w-8 h-8" />
                    <span className="text-3xl font-bold text-purple-900 mb-1">{stats?.donated || 0}</span>
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Pets Donated</span>
                </div>
            </div>
        </div>
    );
}

function CancelRequestButton({ id }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => adoptionAPI.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['adoption-requests', 'sent']);
            toast.success("Request cancelled");
        },
        onError: () => toast.error("Could not cancel request")
    });

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-red-600 h-8"
            onClick={() => {
                if (confirm("Cancel this application?")) mutation.mutate();
            }}
            disabled={mutation.isPending}
        >
            Cancel
        </Button>
    )
}

function EmptyState({ type }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <Loader2 className="w-12 h-12 text-neutral-300 mb-3 opacity-0" /> {/* Spacer or switch icon */}
            <h3 className="text-lg font-medium text-neutral-900">No {type === 'sent' ? 'applications' : 'requests'} found</h3>
            <p className="text-neutral-500 max-w-sm mt-1 mb-6">
                {type === 'sent'
                    ? "You haven't applied for any pets yet."
                    : "No one has submitted a request for your pets yet."}
            </p>
            {type === 'sent' && (
                <Link to="/user/adoption">
                    <Button>Browse Pets</Button>
                </Link>
            )}
        </div>
    );
}

function getStatusColor(status) {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-100';
        case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-100';
        case 'COMPLETED': return 'bg-primary-100 text-primary-800 hover:bg-primary-100';
        case 'CANCELLED': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        default: return 'bg-gray-100 text-gray-800';
    }
}
