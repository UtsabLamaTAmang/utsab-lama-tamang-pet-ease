import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get Current User's Cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } }
            });
        }

        res.json({ success: true, cart: cart.items });
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch cart" });
    }
};

// Add Item to Cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        // Ensure cart exists
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        // Check if item exists in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: parseInt(productId)
                }
            }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: parseInt(productId),
                    quantity
                }
            });
        }

        res.json({ success: true, message: "Item added to cart" });
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ success: false, message: "Failed to add item" });
    }
};

// Remove Item
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId: parseInt(productId)
            }
        });

        res.json({ success: true, message: "Item removed" });
    } catch (error) {
        console.error("Remove Item Error:", error);
        res.status(500).json({ success: false, message: "Failed to remove item" });
    }
};

// Update Quantity
export const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        if (quantity < 1) {
            await prisma.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: parseInt(productId)
                }
            });
        } else {
            await prisma.cartItem.update({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: parseInt(productId)
                    }
                },
                data: { quantity }
            });
        }

        res.json({ success: true, message: "Cart updated" });
    } catch (error) {
        console.error("Update Cart Error:", error);
        res.status(500).json({ success: false, message: "Failed to update cart" });
    }
};
