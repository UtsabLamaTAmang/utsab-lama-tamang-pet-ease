import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');
    const [dashboardLink, setDashboardLink] = useState('/user/dashboard');

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
                    const { user } = await import('@/services/api').then(m => m.authAPI.getMe());

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
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'verifying' && <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />}
                        {status === 'success' && <CheckCircle className="w-12 h-12 text-green-500" />}
                        {status === 'error' && <AlertCircle className="w-12 h-12 text-red-500" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === 'verifying' && 'Processing Payment'}
                        {status === 'success' && 'Payment Successful'}
                        {status === 'error' && 'Payment Failed'}
                    </CardTitle>
                    <CardDescription>
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Button onClick={() => navigate(dashboardLink)} className="w-full">
                        Go to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
