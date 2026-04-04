import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI, authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');
    const [dashboardLink, setDashboardLink] = useState('/user/dashboard');
    const [isDonation, setIsDonation] = useState(false);
    const [campaignId, setCampaignId] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const encodedData = searchParams.get('data');
                if (!encodedData) {
                    setStatus('error');
                    setMessage('Invalid payment data received.');
                    return;
                }

                const response = await paymentAPI.verify({ encodedResponse: encodedData });

                // Handle campaign donation response
                if (response.isDonation) {
                    setIsDonation(true);
                    setCampaignId(response.campaignId);
                    setStatus('success');
                    setMessage('Your donation was successful! Thank you for supporting this campaign. 🐾');
                    return;
                }

                // Check if email verification is needed (Doctor Registration)
                if (response.needsVerification) {
                    setStatus('success');
                    setMessage('Payment successful! Redirecting to email verification...');
                    setTimeout(() => {
                        navigate(`/verify-email?email=${response.email}`);
                    }, 2000);
                    return;
                }

                // Fetch user to determine redirection
                try {
                    const { user } = await authAPI.getMe();
                    if (user?.role === 'ADMIN') setDashboardLink('/admin/dashboard');
                    else if (user?.role === 'DOCTOR') setDashboardLink('/doctor/dashboard');
                    else setDashboardLink('/user/dashboard');
                } catch (e) {
                    console.error("Failed to fetch user info", e);
                }

                setStatus('success');
                setMessage('Payment verified successfully! Your application is now pending admin approval.');

            } catch (error) {
                console.error("Payment verification failed", error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Payment verification failed. Please contact support.');
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        {status === 'verifying' && <Loader2 className="w-16 h-16 text-violet-500 animate-spin" />}
                        {status === 'success' && isDonation && (
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                                    <Heart className="w-8 h-8 text-white fill-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}
                        {status === 'success' && !isDonation && <CheckCircle className="w-16 h-16 text-emerald-500" />}
                        {status === 'error' && <AlertCircle className="w-16 h-16 text-red-500" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {status === 'verifying' && 'Processing Payment'}
                        {status === 'success' && isDonation && '🎉 Donation Successful!'}
                        {status === 'success' && !isDonation && 'Payment Successful'}
                        {status === 'error' && 'Payment Failed'}
                    </CardTitle>
                    <CardDescription className="text-base mt-2 px-2">
                        {message}
                    </CardDescription>

                    {status === 'success' && isDonation && (
                        <div className="mt-4 bg-violet-50 border border-violet-100 rounded-2xl p-4 text-sm text-violet-700 font-medium">
                            Every contribution makes a real difference in the lives of animals. Thank you for your kindness! 🐾
                        </div>
                    )}
                </CardHeader>
                <CardFooter className="flex flex-col gap-3 pt-4">
                    {status === 'success' && isDonation && campaignId && (
                        <Button
                            onClick={() => navigate(`/user/campaigns/${campaignId}`)}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-xl h-11 shadow-md shadow-violet-200"
                        >
                            <Heart className="w-4 h-4 mr-2" />
                            View Campaign
                        </Button>
                    )}
                    <Button
                        variant={isDonation && campaignId ? 'outline' : 'default'}
                        onClick={() => navigate(dashboardLink)}
                        className={`w-full font-bold rounded-xl h-11 ${!isDonation ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' : ''}`}
                    >
                        Go to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
