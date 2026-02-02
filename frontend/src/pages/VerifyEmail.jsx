import React, { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, RotateCw } from "lucide-react";
import Logo from "@/components/common/Logo";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const { verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef([]);

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <CardTitle className="text-red-500 mb-2">Invalid Link</CardTitle>
                    <p>No email address provided for verification.</p>
                    <Button asChild className="mt-4">
                        <Link to="/login">Go to Login</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1].focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        const result = await verifyOTP(email, otpCode);
        setLoading(false);
        if (result.success) {
            navigate("/login");
        } else {
            setError(result.error);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        const result = await resendOTP(email);
        setResendLoading(false);
        if (result.success) {
            setError("");
            alert("OTP resent successfully!");
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
            <Card className="w-full max-w-md shadow-xl bg-white">
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
                        Verify Email
                    </CardTitle>
                    <CardDescription>
                        We've sent a code to <span className="font-semibold text-neutral-800">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    {error && (
                        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-bold bg-neutral-50 focus:ring-primary-500 focus:border-primary-500"
                            />
                        ))}
                    </div>

                    <Button onClick={handleVerifyOtp} className="w-full" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify Account"}
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleResendOtp} disabled={resendLoading} className="text-primary hover:text-primary/80">
                            {resendLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                            Resend Code
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
