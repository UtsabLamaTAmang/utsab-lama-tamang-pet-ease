import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignAPI } from '@/services/api';
import {
    Heart, MapPin, Calendar, Target, TrendingUp, Users,
    Clock, ArrowLeft, Loader2, Trophy, Star
} from 'lucide-react';

function submitEsewaForm(paymentData) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.url;
    const fields = {
        amount: paymentData.amount,
        failure_url: paymentData.failure_url,
        product_delivery_charge: paymentData.product_delivery_charge,
        product_service_charge: paymentData.product_service_charge,
        product_code: paymentData.product_code,
        signature: paymentData.signature,
        signed_field_names: paymentData.signed_field_names,
        success_url: paymentData.success_url,
        tax_amount: paymentData.tax_amount,
        total_amount: paymentData.total_amount,
        transaction_uuid: paymentData.transaction_uuid,
    };
    Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
}

function Avatar({ name, imageUrl, size = 'md' }) {
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' }[size];
    const colors = ['bg-indigo-100 text-indigo-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    if (imageUrl) return <img src={imageUrl} alt={name} className={`${sz} rounded-full object-cover ring-2 ring-white`} />;
    return <div className={`${sz} rounded-full ${color} flex items-center justify-center font-semibold ring-2 ring-white`}>{initials}</div>;
}

function FundingBar({ raised, target }) {
    const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Rs. {raised.toLocaleString()} raised</span>
                <span className="font-semibold text-neutral-700">{percent}% of Rs. {target.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

const AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState(500);
    const [customAmount, setCustomAmount] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [donating, setDonating] = useState(false);
    const [donateError, setDonateError] = useState('');

    useEffect(() => {
        campaignAPI.getDetails(id)
            .then(res => { if (res.success) setCampaign(res.data); else setError('Campaign not found'); })
            .catch(() => setError('Failed to load campaign'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDonate = async () => {
        setDonateError('');
        const amount = isCustom ? parseInt(customAmount) : selectedAmount;
        if (!amount || isNaN(amount) || amount < 10) { setDonateError('Minimum donation is Rs. 10'); return; }
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        setDonating(true);
        try {
            const res = await campaignAPI.donate(id, amount);
            if (res.success && res.data?.url) submitEsewaForm(res.data);
            else { setDonateError(res.message || 'Failed to initiate payment'); setDonating(false); }
        } catch (err) {
            setDonateError(err.response?.data?.message || 'Failed to initiate donation');
            setDonating(false);
        }
    };

    const daysLeft = campaign ? Math.max(0, Math.ceil((new Date(campaign.date) - new Date()) / 86400000)) : 0;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
        </div>
    );

    if (error || !campaign) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Heart className="w-10 h-10 text-neutral-300" />
            <p className="text-neutral-600 font-medium">{error || 'Campaign not found'}</p>
            <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm font-medium flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Go back
            </button>
        </div>
    );

    const donateAmount = isCustom ? parseInt(customAmount) || 0 : selectedAmount;

    return (
        <div className=" mx-auto px-4 py-8 space-y-6">

            {/* Back */}
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Campaigns
            </button>

            {/* Campaign header card */}
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                {campaign.imageUrl && (
                    <div className="h-52 overflow-hidden bg-neutral-100">
                        <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {campaign.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                            {campaign.type === 'VACCINATION' ? 'Vaccination' : 'Donation'}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">{campaign.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{campaign.location}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />
                            {new Date(campaign.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Raised', value: `Rs. ${campaign.raisedAmount.toLocaleString()}`, icon: <TrendingUp className="w-4 h-4" /> },
                    { label: 'Target', value: campaign.targetAmount > 0 ? `Rs. ${campaign.targetAmount.toLocaleString()}` : 'Open', icon: <Target className="w-4 h-4" /> },
                    { label: 'Donors', value: campaign.donorCount || 0, icon: <Users className="w-4 h-4" /> },
                    { label: 'Days Left', value: daysLeft > 0 ? daysLeft : 'Ended', icon: <Clock className="w-4 h-4" /> },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">{s.icon}</div>
                        <div>
                            <p className="text-xs text-neutral-400 font-medium">{s.label}</p>
                            <p className="text-base font-bold text-neutral-900">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two column: content + donation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left column */}
                <div className="lg:col-span-2 space-y-5">

                    {/* About */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-semibold text-neutral-900 mb-3">About this Campaign</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed">{campaign.description}</p>
                    </div>

                    {/* Funding progress */}
                    {campaign.targetAmount > 0 && (
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                            <h2 className="text-base font-semibold text-neutral-900 mb-4">Funding Progress</h2>
                            <FundingBar raised={campaign.raisedAmount} target={campaign.targetAmount} />
                            <p className="text-sm text-neutral-500 mt-3">
                                {campaign.donorCount || 0} donor{campaign.donorCount !== 1 ? 's' : ''} have contributed so far
                            </p>
                        </div>
                    )}

                    {/* Top donors */}
                    {campaign.topDonors?.length > 0 && (
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                            <h2 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                Top Donors
                            </h2>
                            <div className="space-y-2">
                                {campaign.topDonors.map((donor, i) => (
                                    <div key={donor.userId} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-neutral-50 border border-neutral-100">
                                        <span className="w-6 h-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0">{i + 1}</span>
                                        <Avatar name={donor.fullName} imageUrl={donor.imageUrl} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-neutral-800 truncate">{donor.fullName}</p>
                                            <p className="text-xs text-neutral-400">{donor.donationCount} donation{donor.donationCount !== 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="text-sm font-bold text-neutral-900 shrink-0">Rs. {donor.totalAmount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent donations */}
                    {campaign.recentDonations?.length > 0 && (
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                            <h2 className="text-base font-semibold text-neutral-900 mb-4">Recent Donations</h2>
                            <div className="space-y-2">
                                {campaign.recentDonations.map(don => (
                                    <div key={don.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
                                        <Avatar name={don.fullName} imageUrl={don.imageUrl} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-neutral-800 truncate">{don.fullName}</p>
                                            <p className="text-xs text-neutral-400">
                                                {new Date(don.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-700 shrink-0">+Rs. {don.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No donors yet */}
                    {!campaign.topDonors?.length && (
                        <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center">
                            <Heart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-neutral-700 mb-1">Be the first to contribute</p>
                            <p className="text-xs text-neutral-400">Your donation can inspire others to give.</p>
                        </div>
                    )}
                </div>

                {/* Donation sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
                        <div>
                            <h3 className="text-base font-semibold text-neutral-900">Make a Donation</h3>
                            <p className="text-sm text-neutral-500 mt-1">100% of your donation goes to this campaign.</p>
                        </div>

                        {/* Preset amounts */}
                        <div>
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Select Amount</p>
                            <div className="grid grid-cols-3 gap-2">
                                {AMOUNTS.map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => { setSelectedAmount(amt); setIsCustom(false); setCustomAmount(''); }}
                                        className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${!isCustom && selectedAmount === amt
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-indigo-300 hover:text-indigo-700'
                                            }`}
                                    >
                                        Rs.{amt >= 1000 ? `${amt / 1000}k` : amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom amount */}
                        <div>
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Custom Amount</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-medium pointer-events-none">Rs.</span>
                                <input
                                    type="number"
                                    min="10"
                                    placeholder="Enter amount"
                                    value={customAmount}
                                    onChange={e => { setCustomAmount(e.target.value); setIsCustom(true); }}
                                    onFocus={() => setIsCustom(true)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all ${isCustom ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-neutral-600">You are donating</span>
                            <span className="text-base font-bold text-neutral-900">Rs. {donateAmount.toLocaleString()}</span>
                        </div>

                        {donateError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{donateError}</p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleDonate}
                            disabled={donating || campaign.status !== 'ACTIVE'}
                            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {donating ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to eSewa</> :
                                campaign.status !== 'ACTIVE' ? 'Campaign Ended' :
                                    <>Donate via eSewa</>}
                        </button>

                        <p className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            Secure payment powered by eSewa
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
