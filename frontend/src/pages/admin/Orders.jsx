import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Package, Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const API_BASE_URL = "http://localhost:5000/api";

const fetchAllOrders = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const updateOrderStatus = async ({ id, status }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const OrderDetailsDialog = ({ order }) => {
    return (
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Order Details #{order.id}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">Customer Info</h4>
                        <p className="text-sm text-neutral-600">{order.user?.fullName}</p>
                        <p className="text-sm text-neutral-600">{order.user?.email}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Order Info</h4>
                        <p className="text-sm text-neutral-600">Date: {format(new Date(order.createdAt), 'PPP')}</p>
                        <p className="text-sm text-neutral-600">Payment: {order.payment?.method} ({order.payment?.status})</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.orderItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.product.name}</TableCell>
                                    <TableCell className="text-right">Rs. {item.pricePerUnit}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">Rs. {item.pricePerUnit * item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                        <p className="text-sm text-neutral-500">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-600">Rs. {order.totalAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
};

export default function AdminOrders() {
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: fetchAllOrders
    });

    const mutation = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-orders']);
            toast.success("Order status updated");
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const handleStatusChange = (id, newStatus) => {
        mutation.mutate({ id, status: newStatus });
    };

    const filteredOrders = orders?.filter(order =>
        order.user?.fullName.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toString().includes(search)
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PAID': return 'bg-blue-100 text-blue-800'; // Usually paid is a payment status, but order status could be processing
            case 'SHIPPED': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <h1 className="text-2xl font-bold">Order Management</h1>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders?.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{order.user?.fullName}</span>
                                        <span className="text-xs text-neutral-500">{order.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {order.payment?.method}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-bold">Rs. {order.totalAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={order.status}
                                        onValueChange={(val) => handleStatusChange(order.id, val)}
                                        disabled={mutation.isPending || order.status === "DELIVERED" || order.status === "CANCELLED"} // Disable if finalized
                                    >
                                        <SelectTrigger className={`w-[130px] h-8 border-0 ${getStatusColor(order.status)}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">PENDING</SelectItem>
                                            <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                                            <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                                            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="w-4 h-4 text-neutral-500" />
                                            </Button>
                                        </DialogTrigger>
                                        <OrderDetailsDialog order={order} />
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
