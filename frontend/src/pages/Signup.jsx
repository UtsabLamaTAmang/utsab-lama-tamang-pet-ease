import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Mail, User, Phone, CheckCircle2, AlertCircle, RotateCw } from "lucide-react";
import Logo from "@/components/common/Logo";

export default function Signup() {
    const { register, verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        contactNumber: "",
        password: "",
    });
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef([]);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!formData.email || !formData.username || !formData.password) {
            setError("Please fill in all required fields");
            return;
        }
        setLoading(true);
        const result = await register(formData.username, formData.email, formData.contactNumber, formData.password);
        setLoading(false);
        if (result.success) {
            setIsOtpStep(true);
        } else {
            setError(result.error);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        const result = await verifyOTP(formData.email, otpCode);
        setLoading(false);
        if (result.success) {
            navigate("/login");
        } else {
            setError(result.error);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        const result = await resendOTP(formData.email);
        setResendLoading(false);
        if (result.success) {
            setError("");
            // Show success toast/message
        } else {
            setError(result.error);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #f3e8ff 0%, #fef5f1 50%, #f3e8ff 100%)",
            }}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none"></div>

            {/* Main Container */}
            <div className="relative w-full max-w-md z-10 flex flex-col items-center pt-20">
                {/* Top Pets Image - Absolutely positioned */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110%] sm:w-[115%] z-0 pointer-events-none">
                    <img
                        src="/images/pets.png"
                        alt="Cute pets peeking"
                        className="w-full h-auto object-contain"
                        style={{
                            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.12))",
                            mixBlendMode: "multiply",
                        }}
                    />
                </div>

                <Card className="w-full shadow-2xl border-white/50 backdrop-blur-sm bg-white/95 relative z-10">
                    <CardHeader className="space-y-1 text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <Logo />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
                            {isOtpStep ? "Verify Email" : "Create an account"}
                        </CardTitle>
                        <CardDescription>
                            {isOtpStep ? `We've sent a code to ${formData.email}` : "Enter your details below to create your account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className={`p-3 text-sm font-medium border rounded-md flex items-center gap-2 ${error.includes("sent") ? "text-green-600 bg-green-50 border-green-200" : "text-destructive bg-destructive/10 border-destructive/20"}`}>
                                {error.includes("sent") ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {error}
                            </div>
                        )}

                        {isOtpStep ? (
                            <div className="space-y-6">
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
                                            className="w-12 h-14 text-center text-xl font-bold bg-neutral-50"
                                        />
                                    ))}
                                </div>
                                <Button onClick={handleVerifyOtp} className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg" disabled={loading}>
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify Account"}
                                </Button>
                                <div className="flex flex-col items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleResendOtp} disabled={resendLoading} className="text-primary hover:text-primary/80">
                                        {resendLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                                        Resend Code
                                    </Button>
                                    <Button variant="link" size="sm" onClick={() => setIsOtpStep(false)} className="text-muted-foreground">
                                        Wrong email? Go back
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input id="email" name="email" className="pl-10 bg-neutral-50" placeholder="name@example.com" value={formData.email} onChange={handleChange} disabled={loading} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input id="username" name="username" className="pl-10 bg-neutral-50" placeholder="Username" value={formData.username} onChange={handleChange} disabled={loading} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input id="phone" name="contactNumber" className="pl-10 bg-neutral-50" placeholder="Mobile" value={formData.contactNumber} onChange={handleChange} disabled={loading} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input id="password" name="password" type={showPassword ? "text" : "password"} className="pr-10 bg-neutral-50" placeholder="Create a password" value={formData.password} onChange={handleChange} disabled={loading} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg" disabled={loading}>
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Sign up"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                        {!isOtpStep && (
                            <div>
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
