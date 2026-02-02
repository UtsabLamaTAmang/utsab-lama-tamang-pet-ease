import React, { useState } from "react";
import { paymentAPI } from "@/services/api";
import axios from "axios";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle2, User, Briefcase, FileText, ArrowLeft, ArrowRight, Loader2, Upload, AlertCircle } from "lucide-react";
import Logo from "@/components/common/Logo";
import { Link } from "react-router-dom";

export default function DoctorSignup() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        // Personal
        fullName: "", email: "", password: "", confirmPassword: "", phone: "",
        // Professional
        specialization: "", experienceYears: "", fee: "", licenseNumber: "", qualification: "", bio: "", clinicAddress: "",
        // Files (simulated)
        licenseDoc: null, degreeDoc: null, photo: null
    });

    const [previews, setPreviews] = useState({ licenseDoc: null, degreeDoc: null, photo: null });

    // Refs for file inputs
    const licenseInputRef = React.useRef(null);
    const degreeInputRef = React.useRef(null);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
            // Preview logic for images
            if (files[0].type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => setPreviews(prev => ({ ...prev, [name]: reader.result }));
                reader.readAsDataURL(files[0]);
            } else {
                setPreviews(prev => ({ ...prev, [name]: "Document uploaded" }));
            }
        }
    };

    const validateStep = (step) => {
        setError("");
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) return "Please fill all required fields";
            if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        }
        if (step === 2) {
            if (!formData.specialization || !formData.experienceYears || !formData.fee || !formData.licenseNumber) return "Please fill all required fields";
        }
        // Step 3 file validation skipped for mock
        return "";
    };

    const nextStep = () => {
        const err = validateStep(currentStep);
        if (err) { setError(err); return; }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formDataToSend = new FormData();
            // Append simple fields
            Object.keys(formData).forEach(key => {
                if (key !== 'licenseDoc' && key !== 'degreeDoc' && key !== 'photo') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append files if they exist
            if (formData.licenseDoc) formDataToSend.append('licenseDoc', formData.licenseDoc);
            if (formData.degreeDoc) formDataToSend.append('degreeDoc', formData.degreeDoc);
            if (formData.photo) formDataToSend.append('photo', formData.photo);

            // 1. Register Doctor (Creates Account + Profile)
            // const regResponse = await doctorAPI.register(formDataToSend);
            const { data: regResponse } = await axios.post("http://localhost:5000/api/doctors/register", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // 2. We need to login implicitly to make the payment request
            // `registerDoctor` controller returns { success, token, user }
            if (regResponse.token) {
                localStorage.setItem("token", regResponse.token);
                // Also optionally set user, but api.js only checks token for requests
            }

            // 3. Initiate Payment (NPR 1000)
            const paymentRes = await paymentAPI.initiate({
                amount: 1000,
                purpose: 'DOCTOR_REGISTRATION',
                // recordId: regResponse.data.id // if needed
            });

            // 4. Submit eSewa Form
            // Creates a hidden form and submits it
            const { url, ...params } = paymentRes.data;
            const form = document.createElement("form");
            form.setAttribute("method", "POST");
            form.setAttribute("action", url);
            form.setAttribute("target", "_self");

            for (const key in params) {
                const hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", params[key]);
                form.appendChild(hiddenField);
            }

            document.body.appendChild(form);
            form.submit();

            // Note: success state won't be reached here due to redirect
        } catch (err) {
            console.error("Doctor registration/payment failed", err);
            setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
            setLoading(false);
        }
    };


    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
                <Card className="max-w-md w-full text-center p-8 space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Application Submitted!</h2>
                        <p className="text-neutral-600 mt-2">Your application is under review. We will notify you once verified.</p>
                    </div>
                    <Button asChild className="w-full">
                        <Link to="/login">Back to Login</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const steps = [
        { id: 1, label: "Personal", icon: User },
        { id: 2, label: "Professional", icon: Briefcase },
        { id: 3, label: "Documents", icon: FileText },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50/50">
            <header className="px-6 py-4 bg-white border-b border-neutral-200">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link to="/"><Logo /></Link>
                    <div className="text-sm text-neutral-500">
                        Already a partner? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="max-w-3xl w-full space-y-8">
                    {/* Stepper */}
                    <div className="relative flex justify-between max-w-lg mx-auto">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-200 -z-10 -translate-y-1/2 rounded-full"></div>
                        <div className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>

                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep >= step.id;
                            const isCurrent = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-neutral-50 px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? "bg-primary border-primary text-white" : "bg-white border-neutral-300 text-neutral-400"}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs font-medium ${isCurrent ? "text-primary" : "text-neutral-500"}`}>{step.label}</span>
                                </div>
                            )
                        })}
                    </div>

                    <Card className="border-0 shadow-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-secondary-400"></div>
                        <CardHeader>
                            <CardTitle className="text-2xl">Doctor Registration</CardTitle>
                            <CardDescription>Join our network of trusted veterinary professionals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="mb-6 p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <form className="space-y-6">
                                {currentStep === 1 && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Full Name</Label>
                                                <Input name="fullName" placeholder="Dr. Jane Doe" value={formData.fullName} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input name="email" type="email" placeholder="doctor@example.com" value={formData.email} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Phone</Label>
                                                <Input name="phone" placeholder="+1 234 567 890" value={formData.phone} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Clinic Address</Label>
                                                <Input name="clinicAddress" placeholder="123 Vet Street" value={formData.clinicAddress} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Password</Label>
                                                <Input name="password" type="password" value={formData.password} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Confirm Password</Label>
                                                <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Specialization</Label>
                                                <select
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="" disabled>Select Specialization</option>
                                                    <option value="General Checkup">General Checkup</option>
                                                    <option value="Emergency / Critical">Emergency / Critical</option>
                                                    <option value="Skin & Allergy">Skin & Allergy</option>
                                                    <option value="Surgery">Surgery</option>
                                                    <option value="Dental Care">Dental Care</option>
                                                    <option value="Vaccination">Vaccination</option>
                                                    <option value="Nutrition & Diet">Nutrition & Diet</option>
                                                    <option value="Behavior & Training">Behavior & Training</option>
                                                    <option value="Eye & Ear Problems">Eye & Ear Problems</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Experience (Years)</Label>
                                                <Input name="experienceYears" type="number" placeholder="5" value={formData.experienceYears} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Qualification</Label>
                                                <Input name="qualification" placeholder="DVM, PhD" value={formData.qualification} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Consultation Fee (Rs.)</Label>
                                                <Input name="fee" type="number" placeholder="50" value={formData.fee} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>License Number</Label>
                                            <Input name="licenseNumber" placeholder="LIC-123456" value={formData.licenseNumber} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bio</Label>
                                            <Textarea name="bio" placeholder="Tell us about your practice..." value={formData.bio} onChange={handleChange} />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>License Document</Label>
                                                <div
                                                    className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-neutral-50 transition cursor-pointer relative flex flex-col items-center justify-center min-h-[150px]"
                                                    onClick={() => licenseInputRef.current?.click()}
                                                >
                                                    <input
                                                        type="file"
                                                        name="licenseDoc"
                                                        ref={licenseInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                    {previews.licenseDoc ? (
                                                        <img src={previews.licenseDoc} alt="License Preview" className="max-h-32 object-contain mb-2" />
                                                    ) : (
                                                        <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                                                    )}
                                                    <p className="text-sm text-neutral-600">{formData.licenseDoc ? formData.licenseDoc.name : "Upload License (Image)"}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Degree Certificate</Label>
                                                <div
                                                    className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-neutral-50 transition cursor-pointer relative flex flex-col items-center justify-center min-h-[150px]"
                                                    onClick={() => degreeInputRef.current?.click()}
                                                >
                                                    <input
                                                        type="file"
                                                        name="degreeDoc"
                                                        ref={degreeInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                    {previews.degreeDoc ? (
                                                        <img src={previews.degreeDoc} alt="Degree Preview" className="max-h-32 object-contain mb-2" />
                                                    ) : (
                                                        <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                                                    )}
                                                    <p className="text-sm text-neutral-600">{formData.degreeDoc ? formData.degreeDoc.name : "Upload Degree (Image)"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Profile Photo</Label>
                                            <div className="flex items-center gap-4">
                                                {previews.photo && <img src={previews.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />}
                                                <Input type="file" name="photo" onChange={handleFileChange} accept="image/*" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between bg-neutral-50/50 p-6">
                            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            {currentStep < 3 ? (
                                <Button onClick={nextStep}>
                                    Next <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading} className="bg-success-600 hover:bg-success-700 text-white">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Redirecting to Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Submit & Pay
                                        </>
                                    )}

                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}
