import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentFailure() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
                    <CardDescription>
                        We could not process your payment. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={() => navigate('/doctor/signup')} className="w-full">
                        Try Again
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                        Go Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
