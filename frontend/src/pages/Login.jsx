import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/auth/AuthShell";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        const result = await login(formData.email, formData.password);
        setLoading(false);

        if (result.success) {
            const role = result.user?.role;
            if (role === "ADMIN") {
                navigate("/admin/dashboard");
            } else if (role === "DOCTOR") {
                navigate("/doctor/dashboard");
            } else if (role === "RESCUER") {
                navigate("/rescuer/dashboard");
            } else {
                navigate("/user/dashboard");
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <AuthShell
            eyebrow="Welcome Back"
            title="Sign in"
            description="Enter your username or email address and continue to your PetEase account."
            alternatePrompt="No account?"
            alternateLinkText="Sign up"
            alternateLinkTo="/signup"
            footer={
                <div className="flex flex-col gap-2 text-xs text-neutral-500 sm:flex-row sm:justify-between sm:gap-4">
                    <p>
                        Are you a doctor?{" "}
                        <Link to="/doctor-signup" className="font-medium text-info-600 hover:text-info-700">
                            Join as a specialist
                        </Link>
                    </p>
                    <p>
                        Want to help pets?{" "}
                        <Link to="/rescuer-signup" className="font-medium text-warning-700 hover:text-warning-800">
                            Become a rescuer
                        </Link>
                    </p>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[0.82rem] font-medium text-neutral-700">
                        Enter your username or email address
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="text"
                        placeholder="Username or email address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="h-12 rounded-xl border-neutral-200 bg-[#fcfbfa] px-4 shadow-none focus-visible:border-primary-300 focus-visible:ring-primary-200/70"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password" className="text-[0.82rem] font-medium text-neutral-700">
                            Enter your password
                        </Label>
                        <Link to="#" className="text-[11px] font-medium text-[#dd7d5f] hover:text-[#c86547]">
                            Forgot Password
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
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
                    className="h-12 w-full rounded-xl border-0 bg-[#c6b8f5] text-sm font-semibold text-white shadow-[0_10px_25px_rgba(198,184,245,0.45)] transition-all hover:bg-[#b6a4f0] hover:shadow-[0_14px_32px_rgba(182,164,240,0.52)]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Sign in"
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
