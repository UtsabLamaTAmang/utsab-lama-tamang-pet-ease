import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "@/components/common/Logo";

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
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #f3e8ff 0%, #fef5f1 50%, #f3e8ff 100%)",
            }}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10"></div>
            </div>

            {/* Main Container */}
            <div className="relative w-full max-w-md z-10 flex flex-col items-center pt-24 sm:pt-32">
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
                        <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">Sign in</CardTitle>
                        <CardDescription>
                            Enter your email to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email or Username</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="text"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="bg-neutral-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        to="#"
                                        className="text-xs font-medium text-primary hover:text-primary/80"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="bg-neutral-50 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-primary/25" disabled={loading}>
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
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                        <div>
                            Don&apos;t have an account?{" "}
                            <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline">
                                Sign up
                            </Link>
                        </div>
                        <div className="pt-2 border-t border-neutral-100 w-full">
                            <p className="text-xs text-neutral-500">
                                Are you a doctor?{" "}
                                <Link to="/doctor-signup" className="font-medium text-primary hover:text-primary/80 hover:underline">
                                    Join as a Specialist
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
