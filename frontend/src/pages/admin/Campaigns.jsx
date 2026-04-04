import { useState, useRef, useEffect } from 'react';
import { campaignAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar, MapPin, Activity, Shield, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', type: 'VACCINATION', location: '', date: '', status: 'ACTIVE'
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const res = await campaignAPI.getAll();
            if (res.success) {
                setCampaigns(res.data);
            }
        } catch (error) {
            toast.error("Failed to fetch campaigns");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', type: 'VACCINATION', location: '', date: '', status: 'ACTIVE' });
        setEditingCampaign(null);
    };

    const handleAddCampaign = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEditCampaign = (campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            title: campaign.title,
            description: campaign.description,
            type: campaign.type,
            location: campaign.location,
            date: new Date(campaign.date).toISOString().split('T')[0],
            status: campaign.status,
        });
        setIsModalOpen(true);
    };

    const handleDeleteCampaign = async (id) => {
        if (confirm("Are you sure you want to delete this campaign?")) {
            try {
                await campaignAPI.delete(id);
                toast.success("Campaign deleted");
                fetchCampaigns();
            } catch (error) {
                toast.error("Failed to delete campaign");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            if (editingCampaign) {
                await campaignAPI.update(editingCampaign.id, formData);
                toast.success("Campaign updated successfully");
            } else {
                await campaignAPI.create(formData);
                toast.success("Campaign created successfully");
            }
            setIsModalOpen(false);
            fetchCampaigns();
        } catch (error) {
            toast.error("Failed to save campaign");
            console.error(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Campaign Management</h1>
                    <p className="text-neutral-500 mt-1">Create and oversee community vaccination and donation drives.</p>
                </div>
                <Button onClick={handleAddCampaign} className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all rounded-xl h-10 px-5 font-medium">
                    <Plus className="h-4 w-4" /> New Campaign
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/60 overflow-hidden">
                {campaigns.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-5">
                            <Activity className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">No Campaigns Found</h3>
                        <p className="text-neutral-500 max-w-md mb-6">Start by creating your first campaign drive to engage the community.</p>
                        <Button onClick={handleAddCampaign} variant="outline" className="gap-2 h-10 px-6 rounded-xl font-medium border-neutral-200 hover:bg-neutral-50">
                            <Plus className="w-4 h-4" /> Create Campaign
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50/80 border-b border-neutral-200/80">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Campaign Details</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Location & Date</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {campaigns.map((campaign) => {
                                    const isVaccination = campaign.type === 'VACCINATION';
                                    return (
                                        <tr key={campaign.id} className="hover:bg-neutral-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                                        {campaign.title}
                                                    </span>
                                                    <span className="text-neutral-500 text-xs mt-1 line-clamp-1 max-w-xs block">
                                                        {campaign.description}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isVaccination ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 'bg-purple-50 text-purple-700 border-purple-200/60'}`}>
                                                    {isVaccination ? <Shield className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                                                    {isVaccination ? 'Vaccination' : 'Donation'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 whitespace-nowrap">
                                                    <div className="flex items-center text-neutral-600 text-xs">
                                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
                                                        {campaign.location}
                                                    </div>
                                                    <div className="flex items-center text-neutral-600 text-xs">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
                                                        {new Date(campaign.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${campaign.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200/60' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign)} className="h-8 px-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id)} className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[550px] rounded-2xl">
                    <DialogHeader className="border-b border-neutral-100 pb-4 mb-2">
                        <DialogTitle className="text-xl font-bold text-neutral-900">{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-neutral-700">Campaign Title</Label>
                            <Input name="title" value={formData.title} onChange={handleInputChange} className="h-10 rounded-xl" placeholder="e.g. Community Rabies Vaccination" required />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-neutral-700">Description</Label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="rounded-xl resize-none" placeholder="Details about the campaign..." required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-neutral-700">Campaign Type</Label>
                                <Select value={formData.type} onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}>
                                    <SelectTrigger className="h-10 rounded-xl">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="VACCINATION">Vaccination</SelectItem>
                                        <SelectItem value="PET_DONATION">Pet Donation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-neutral-700">Status</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}>
                                    <SelectTrigger className="h-10 rounded-xl">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-neutral-700">Location</Label>
                                <Input name="location" value={formData.location} onChange={handleInputChange} className="h-10 rounded-xl" placeholder="e.g. Central Park" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-neutral-700">Date</Label>
                                <Input type="date" name="date" value={formData.date} onChange={handleInputChange} className="h-10 rounded-xl" required />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="h-10 px-4 rounded-xl text-neutral-600">Cancel</Button>
                            <Button type="submit" disabled={submitLoading} className="h-10 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white">{submitLoading ? 'Saving...' : 'Save Campaign'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
