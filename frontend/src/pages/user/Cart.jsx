import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Loader2, MapPin, Phone, CreditCard, Banknote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = "http://localhost:5000/api";

const CheckoutModal = ({ isOpen, onClose, totalAmount, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shippingAddress: '',
        phone: '',
        paymentMethod: 'ESEWA' // 'ESEWA' or 'COD'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/orders/checkout`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                if (response.data.paymentMethod === 'COD') {
                    toast.success("Order placed successfully!");
                    onSuccess();
                } else if (response.data.paymentMethod === 'ESEWA') {
                    // Auto-submit form to Esewa
                    const paymentData = response.data.paymentData;
                    const form = document.createElement("form");
                    form.setAttribute("method", "POST");
                    form.setAttribute("action", paymentData.url);

                    for (const key in paymentData) {
                        if (key !== 'url') {
                            const hiddenField = document.createElement("input");
                            hiddenField.setAttribute("type", "hidden");
                            hiddenField.setAttribute("name", key);
                            hiddenField.setAttribute("value", paymentData[key]);
                            form.appendChild(hiddenField);
                        }
                    }

                    document.body.appendChild(form);
                    form.submit();
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Checkout failed");
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Checkout</DialogTitle>
                    <DialogDescription>
                        Enter your shipping details to complete the order.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Shipping Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Textarea
                                    id="address"
                                    placeholder="Enter your full delivery address"
                                    className="pl-9 min-h-[80px]"
                                    required
                                    value={formData.shippingAddress}
                                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="98XXXXXXXX"
                                    className="pl-9"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Payment Method</Label>
                            <RadioGroup
                                value={formData.paymentMethod}
                                onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="ESEWA" id="esewa" className="peer sr-only" />
                                    <Label
                                        htmlFor="esewa"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <CreditCard className="mb-2 h-6 w-6 text-green-600" />
                                        <span className="font-semibold">eSewa</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="COD" id="cod" className="peer sr-only" />
                                    <Label
                                        htmlFor="cod"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <Banknote className="mb-2 h-6 w-6 text-neutral-600" />
                                        <span className="font-semibold">Cash on Delivery</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="min-w-[120px]">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {formData.paymentMethod === 'ESEWA' ? `Pay Rs. ${totalAmount.toLocaleString()}` : 'Place Order'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartCount, clearCart } = useCart();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const navigate = useNavigate();

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over 1000
    const total = subtotal + shipping;

    const handleOrderSuccess = () => {
        // Clear cart context
        // NOTE: The backend effectively clears the cart, 
        // calling clearCart here ensures frontend context is in sync without refetching immediately
        // If we implement clearCart in context, use it. Otherwise, refetch or manually clear.
        // Assuming context has no clearCart or we just force reload/redirect
        navigate('/user/dashboard'); // Or orders page
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white">
                <div className="w-32 h-32 bg-neutral-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
                    <ShoppingBag className="w-12 h-12 text-neutral-300" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
                <p className="text-neutral-500 max-w-md text-center mb-8 text-lg">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Link to="/user/shop">
                    <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105">
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-8 lg:py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 lg:mb-12">
                    <Link to="/user/shop" className="p-2 -ml-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-neutral-500 hover:text-neutral-900">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
                        Shopping Cart <span className="text-neutral-300 font-light ml-2">.</span> <span className="text-xl font-medium text-neutral-400 align-middle">{cartCount} Items</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* Cart Items List - Takes more space */}
                    <div className="xl:col-span-8 space-y-6">
                        {cart.map((item) => (
                            <div key={item.id} className="group flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300">
                                {/* Product Image - Larger */}
                                <div className="w-full sm:w-40 h-40 bg-neutral-50 rounded-3xl flex-shrink-0 p-4">
                                    <img
                                        src={`http://localhost:5000${item.images?.[0]}`}
                                        alt={item.name}
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                    <div className="space-y-2 flex-1">
                                        <p className="text-xs font-bold tracking-wider text-neutral-400 uppercase">{item.category}</p>
                                        <h3 className="text-xl font-bold text-neutral-900 leading-tight">{item.name}</h3>
                                        <p className="text-2xl font-bold text-primary-600">Rs. {item.price}</p>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-6 self-end sm:self-center">
                                        <div className="flex items-center gap-4 bg-neutral-50 rounded-full p-2 border border-neutral-100">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-10 h-10 rounded-full bg-white text-neutral-600 flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg w-8 text-center tabular-nums">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md hover:bg-neutral-800 hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="w-10 h-10 rounded-full border border-neutral-200 text-neutral-400 flex items-center justify-center hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all hover:rotate-12"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary - Clean & Spacious */}
                    <div className="xl:col-span-4 sticky top-24">
                        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-neutral-100 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-8">Order Details</h3>

                            <div className="space-y-6 mb-8">
                                <div className="flex justify-between items-center text-neutral-500 text-lg">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-neutral-900">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-neutral-500 text-lg">
                                    <span>Shipping</span>
                                    <span className="font-medium text-neutral-900">
                                        {shipping === 0 ? <span className="text-green-600">Free</span> : `Rs. ${shipping}`}
                                    </span>
                                </div>

                                <div className="h-px bg-neutral-100 my-2" />

                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-xl text-neutral-900">Total</span>
                                    <div className="text-right">
                                        <span className="block text-4xl font-bold text-primary-600 tracking-tight">
                                            Rs. {total.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-neutral-400 font-medium">Including VAT</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsCheckoutOpen(true)}
                                className="w-full rounded-full h-16 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-4"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>

                            <p className="text-center text-sm text-neutral-400 font-medium">
                                Secure Checkout - SSL Encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                totalAmount={total}
                onSuccess={handleOrderSuccess}
            />
        </div>
    );
}
