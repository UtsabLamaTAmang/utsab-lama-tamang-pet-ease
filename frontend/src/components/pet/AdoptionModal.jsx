import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { adoptionAPI } from '@/services/api';

export default function AdoptionModal({ isOpen, onClose, pet }) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await adoptionAPI.create({
                petId: pet.id,
                reason: data.message,
                experience: "Not specified", // We can add fields for these later if needed
                livingSpace: "Not specified",
                hasOtherPets: false
            });

            if (res.success) {
                // Custom success toast
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex p-4 ring-1 ring-black ring-opacity-5 border border-green-100`}>
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-gray-900">Application Sent!</p>
                            <p className="mt-1 text-sm text-gray-500">The owner has been notified. Check your email for next steps.</p>
                        </div>
                    </div>
                ));
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send application. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Adopt {pet?.name}</DialogTitle>
                    <DialogDescription>
                        Complete the form below to submit your adoption application.
                        {pet.adoptionFee && pet.adoptionFee > 0 && (
                            <span className="block mt-2 font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-md w-fit text-sm">
                                Adoption Fee: Rs. {pet.adoptionFee}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Applicant Info */}
                    <div className="flex items-center gap-4 p-4 border border-neutral-200 rounded-xl bg-neutral-50">
                        <div className="h-10 w-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div>
                            <p className="font-medium text-neutral-900">{user?.fullName}</p>
                            <p className="text-sm text-neutral-500">{user?.email}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto bg-white text-green-600 border-green-200 gap-1 shadow-sm">
                            <ShieldCheck size={12} /> Verified
                        </Badge>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message to Owner</Label>
                        <Textarea
                            id="message"
                            placeholder="Tell the owner why you'd be a great match..."
                            className="min-h-[120px] resize-none"
                            {...register("message", { required: true })}
                        />
                        {errors.message && <span className="text-xs text-red-500">Message is required.</span>}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-2">
                        <Checkbox id="terms" required className="mt-0.5" />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I confirm that I can provide a safe and loving home.
                            </label>
                            <p className="text-xs text-muted-foreground">
                                By submitting, you agree to share your contact details.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                </>
                            ) : "Submit Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
