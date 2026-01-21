import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, Calendar, CreditCard, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const API_BASE_URL = "http://localhost:5000/api";

const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const OrderItem = ({ order }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'PAID': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'SHIPPED': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            case 'DELIVERED': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'CANCELLED': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const expectedDelivery = addDays(new Date(order.createdAt), 5); // 5 days from order

    return (
        <Card className="mb-4 overflow-hidden border-neutral-200">
            <CardHeader className="p-4 bg-neutral-50/50 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">Order #{order.id}</span>
                        <Badge className={`${getStatusColor(order.status)} border-0`}>{order.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(order.createdAt), 'PPP')}
                        </span>
                        <span className="flex items-center gap-1.5 text-primary-600 font-medium">
                            <Package className="w-3.5 h-3.5" />
                            Exp. Delivery: {format(expectedDelivery, 'PPP')}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">Rs. {order.totalAmount.toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1.5 text-sm text-neutral-500 mt-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        {order.payment?.method || 'N/A'}
                        {order.payment?.status === 'SUCCESS' && <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-1" />}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full flex justify-between items-center rounded-none h-10 px-4 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50">
                            <span className="text-xs font-medium uppercase tracking-wider">{order.orderItems.length} Items</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2 bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-neutral-100">
                                        <TableHead className="w-[60%]">Product</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.orderItems.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-neutral-50/50 border-b-neutral-100 last:border-0">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.product.images?.[0] && (
                                                            <img
                                                                src={`http://localhost:5000${item.product.images[0]}`}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <span className="line-clamp-1">{item.product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-neutral-500">Rs. {item.pricePerUnit}</TableCell>
                                            <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-bold">Rs. {(item.pricePerUnit * item.quantity).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
};

export default function UserOrders() {
    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['my-orders'],
        queryFn: fetchOrders
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-20 text-red-500">
                <p>Failed to load orders. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto py-4 px-4">
            <div className="flex items-center gap-3 mb-8">
                <Package className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                    <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900">No orders yet</h3>
                    <p className="text-neutral-500 text-sm mt-1">Start shopping to see your orders here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <OrderItem key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
