import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI } from '@/services/api';
import { Heart, Calendar, MapPin, TrendingUp, ArrowRight, Target, Loader2, LayoutGrid } from 'lucide-react';

function ProgressBar({ raised, target }) {
    const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
                <span>Rs. {(raised || 0).toLocaleString()} raised</span>
                <span className="font-semibold text-neutral-700">{percent}%</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

function CampaignCard({ campaign }) {
    const navigate = useNavigate();
    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.date) - new Date()) / 86400000));

    return (
        <div
            onClick={() => navigate(`/user/campaigns/${campaign.id}`)}
            className="group bg-white rounded-xl border border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
        >
            {/* Only render image section if image exists */}
            {campaign.imageUrl && (
                <div className="h-36 overflow-hidden bg-neutral-100 shrink-0">
                    <img
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                </div>
            )}

            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Status + days */}
                <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Active
                    </span>
                    <span className="text-xs text-neutral-400">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                    </span>
                </div>

                {/* Title */}
                <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 text-sm leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2 mb-1">
                        {campaign.title}
                    </h3>
                    <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2">
                        {campaign.description}
                    </p>
                </div>

                {/* Progress */}
                {campaign.targetAmount > 0 ? (
                    <ProgressBar raised={campaign.raisedAmount} target={campaign.targetAmount} />
                ) : campaign.raisedAmount > 0 ? (
                    <p className="text-xs text-neutral-500">
                        <span className="font-semibold text-neutral-800">Rs. {campaign.raisedAmount.toLocaleString()}</span> raised
                    </p>
                ) : null}

                {/* Meta */}
                <div className="text-xs text-neutral-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{new Date(campaign.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{campaign.location}</span>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-indigo-600">
                    <span className="text-xs font-semibold">Donate</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}

export default function UserCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        campaignAPI.getAll({ status: 'ACTIVE' })
            .then(res => { if (res.success) setCampaigns(res.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalRaised = campaigns.reduce((s, c) => s + (c.raisedAmount || 0), 0);
    const totalTarget = campaigns.reduce((s, c) => s + (c.targetAmount || 0), 0);

    return (
        <div className=" mx-auto px-6 py-6 space-y-6">

            {/* Page header */}
            <div>
                <h1 className="text-xl font-bold text-neutral-900">Campaigns</h1>
                <p className="text-sm text-neutral-500 mt-0.5">Support active campaigns and make a difference for animals.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Active Campaigns', value: campaigns.length, icon: <LayoutGrid className="w-4 h-4" /> },
                    { label: 'Total Raised', value: `Rs. ${totalRaised.toLocaleString()}`, icon: <TrendingUp className="w-4 h-4" /> },
                    { label: 'Funding Target', value: totalTarget ? `Rs. ${totalTarget.toLocaleString()}` : '—', icon: <Target className="w-4 h-4" /> },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400">{s.label}</p>
                            <p className="text-base font-bold text-neutral-900 leading-tight">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-7 h-7 text-neutral-400 animate-spin" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                    <Heart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-neutral-700">No active campaigns</p>
                    <p className="text-xs text-neutral-400 mt-1">Check back soon for new campaigns.</p>
                </div>
            ) : (
                <>
                    <p className="text-xs text-neutral-400 font-medium">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} available</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
                    </div>
                </>
            )}
        </div>
    );
}
