import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Esewa Configuration
const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const MERCHANT_ID = "EPAYTEST";
const SECRET_KEY = "8gBm/:&EnhH.1/q";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Helper: Generate Signature
const generateSignature = (message) => {
    const hmac = crypto.createHmac("sha256", SECRET_KEY);
    hmac.update(message);
    return hmac.digest("base64");
};

// @desc    Checkout (Create Order & Initiate Payment)
// @route   POST /api/orders/checkout
// @access  Private
export const checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethod, shippingAddress, phone } = req.body; // paymentMethod: 'COD' or 'ESEWA'

        // 1. Get Cart Items
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2. Calculate Total
        let totalAmount = 0;
        const orderItemsData = cart.items.map(item => {
            totalAmount += item.product.price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                pricePerUnit: item.product.price
            };
        });

        // Add Shipping logic if needed (e.g. > 1000 free, else 100)
        // For simplicity reusing frontend logic or defining a standard rule
        let shippingCost = totalAmount > 1000 ? 0 : 100;
        totalAmount += shippingCost;

        // 3. Create Order
        // Using transaction to ensure atomicity
        const result = await prisma.$transaction(async (prisma) => {
            // Create Order
            const order = await prisma.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: "PENDING",
                    orderItems: {
                        create: orderItemsData
                    }
                }
            });

            // Create Payment Record
            const transactionUuid = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const payment = await prisma.payment.create({
                data: {
                    userId,
                    amount: totalAmount,
                    method: paymentMethod,
                    status: "PENDING",
                    type: "ORDER",
                    transactionId: transactionUuid,
                    order: { connect: { id: order.id } }
                }
            });

            // Clear Cart
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

            return { order, payment, transactionUuid };
        });

        const { order, payment, transactionUuid } = result;

        // 4. Handle Response based on Payment Method

        if (paymentMethod === 'COD') {
            return res.status(201).json({
                success: true,
                paymentMethod: 'COD',
                message: "Order placed successfully",
                orderId: order.id
            });
        }
        else if (paymentMethod === 'ESEWA') {
            // Initiate Esewa
            // For EPAYTEST, we might need to send 100 if it fails with real amount.
            // But let's try real amount first. 
            // NOTE: EPAYTEST often validates total_amount to be EXACTLY what is signed.
            const esewaAmount = totalAmount.toString();
            const productCode = MERCHANT_ID;

            const signatureMessage = `total_amount=${esewaAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
            const signature = generateSignature(signatureMessage);

            const esewaData = {
                amount: esewaAmount,
                failure_url: `${CLIENT_URL}/payment/failure`,
                product_delivery_charge: "0",
                product_service_charge: "0",
                product_code: productCode,
                signature: signature,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                success_url: `${CLIENT_URL}/payment/success`,
                tax_amount: "0",
                total_amount: esewaAmount,
                transaction_uuid: transactionUuid,
                url: ESEWA_URL
            };

            return res.status(201).json({
                success: true,
                paymentMethod: 'ESEWA',
                message: "Order created, redirecting to payment",
                paymentData: esewaData
            });
        }
        else {
            return res.status(400).json({ message: "Invalid payment method" });
        }

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: "Checkout failed", error: error.message });
    }
};

// @desc    Get My Orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: { include: { product: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

// @desc    Get All Orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                orderItems: { include: { product: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
};

// @desc    Update Order Status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const orderId = parseInt(id);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status === "DELIVERED" || order.status === "CANCELLED") {
            return res.status(400).json({ message: `Cannot change status of ${order.status} order` });
        }

        // Check if we need to refund (Simulated mostly, but updates DB)
        if (status === "CANCELLED" && order.payment?.method === "ESEWA" && order.payment?.status === "SUCCESS") {
            await prisma.payment.update({
                where: { orderId },
                data: { status: "REFUNDED" }
            });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                orderItems: { include: { product: true } },
                payment: true
            }
        });

        res.json({ success: true, message: "Order status updated", order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};
