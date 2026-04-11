import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Phone,
    RotateCw,
    User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/auth/authShell";

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
        const nextOtp = [...otp];
        nextOtp[index] = value.substring(value.length - 1);
        setOtp(nextOtp);
        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
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
        const result = await register(
            formData.username,
            formData.email,
            formData.contactNumber,
            formData.password,
        );
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
            setError("A new verification code has been sent.");
        } else {
            setError(result.error);
        }
    };

    const messageTone = error.includes("sent") ? "success" : "error";

    return (
        <AuthShell
            eyebrow={isOtpStep ? "Verify Account" : "New To PetEase"}
            title={isOtpStep ? "Check your email" : "Sign up"}
            description={
                isOtpStep
                    ? `Enter the 6-digit code we sent to ${formData.email}.`
                    : "Create your account to manage adoptions, orders, appointments, and rescue updates."
            }
            alternatePrompt={isOtpStep ? "Need changes?" : "Have an account?"}
            alternateLinkText={isOtpStep ? "Edit details" : "Sign in"}
            alternateLinkTo={isOtpStep ? "/signup" : "/login"}
        >
            <div className="space-y-5">
                {error && (
                    <div
                        className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${messageTone === "success"
                            ? "border border-success-200 bg-success-50 text-success-700"
                            : "border border-danger-200 bg-danger-50 text-danger-700"
                            }`}
                    >
                        {messageTone === "success" ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                        ) : (
                            <AlertCircle className="h-4 w-4 shrink-0" />
                        )}
                        <span>{error}</span>
                    </div>
                )}

                {isOtpStep ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="flex justify-between gap-2 sm:gap-3">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="h-14 w-11 rounded-2xl border-neutral-200 bg-[#fcfbfa] p-0 text-center text-lg font-semibold shadow-none focus-visible:border-primary-300 focus-visible:ring-primary-200/70 sm:w-12"
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 w-full rounded-xl border-0 bg-[#c6b8f5] text-sm font-semibold text-white shadow-[0_10px_25px_rgba(198,184,245,0.45)] transition-all hover:bg-[#b6a4f0]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify account"
                            )}
                        </Button>

                        <div className="flex flex-col items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleResendOtp}
                                disabled={resendLoading}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                {resendLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RotateCw className="mr-2 h-4 w-4" />
                                )}
                                Resend code
                            </Button>
                            <button
                                type="button"
                                onClick={() => setIsOtpStep(false)}
                                className="text-sm text-neutral-500 transition-colors hover:text-neutral-800"
                            >
                                Go back and edit details
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[0.82rem] font-medium text-neutral-700">
                                Email address
                            </Label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="name@example.com"
                                    className="h-12 rounded-xl border-neutral-200 bg-[#fcfbfa] pl-11 shadow-none focus-visible:border-primary-300 focus-visible:ring-primary-200/70"
                                />
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-[0.82rem] font-medium text-neutral-700">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="petlover"
                                        className="h-12 rounded-xl border-neutral-200 bg-[#fcfbfa] pl-11 shadow-none focus-visible:border-primary-300 focus-visible:ring-primary-200/70"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactNumber" className="text-[0.82rem] font-medium text-neutral-700">
                                    Phone
                                </Label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        id="contactNumber"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Mobile number"
                                        className="h-12 rounded-xl border-neutral-200 bg-[#fcfbfa] pl-11 shadow-none focus-visible:border-primary-300 focus-visible:ring-primary-200/70"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[0.82rem] font-medium text-neutral-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Create a password"
                                    className="h-12 rounded-xl border-neutral-200 bg-[#fcfbfa] px-4 pr-11 shadow-none focus-visible:border-primary-300 focus-visible:ring-primary-200/70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 w-full rounded-xl border-0 bg-[#c6b8f5] text-sm font-semibold text-white shadow-[0_10px_25px_rgba(198,184,245,0.45)] transition-all hover:bg-[#b6a4f0]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Sign up"
                            )}
                        </Button>

                        <p className="text-center text-xs leading-5 text-neutral-500">
                            By continuing, you agree to receive account verification emails and security updates.
                        </p>
                    </form>
                )}
            </div>
        </AuthShell>
    );
}
