import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all products with filters
export const getAllProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, inStock } = req.query;

        const where = {};

        if (category) where.category = category;
        if (inStock === "true") where.stock = { gt: 0 };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: products,
            count: products.length,
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message,
        });
    }
};

// Create product (admin only)
export const createProduct = async (req, res) => {
    try {
        console.log("DEBUG: createProduct Headers:", req.headers['content-type']);
        console.log("DEBUG: createProduct req.files:", req.files);
        console.log("DEBUG: createProduct req.body.images (type):", typeof req.body.images, req.body.images);

        console.log("DEBUG: createProduct called with body:", req.body);
        const { name, description, price, stock, category } = req.body;
        // Collect all images
        const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, price, and category are required",
            });
        }

        const parsedPrice = parseInt(price);
        const parsedStock = parseInt(stock);

        if (isNaN(parsedPrice) || isNaN(parsedStock)) {
            return res.status(400).json({ success: false, message: "Price and stock must be valid numbers" });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || '',
                price: parsedPrice,
                category,
                stock: parsedStock,
                images // Use 'images' array field, NOT imageUrl
            },
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });

    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message,
        });
    }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const {
            name,
            description,
            price,
            category,
            stock,
        } = req.body;

        let updateData = {
            name,
            description,
            price: price ? parseInt(price) : undefined,
            category,
            stock: stock ? parseInt(stock) : undefined,
        };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => `/uploads/products/${file.filename}`);
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData,
        });


        res.json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct,
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message,
        });
    }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.product.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message,
        });
    }
};

// Create order
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items are required",
            });
        }

        // Calculate total and validate stock
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // Create order with items
        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount,
                shippingAddress,
                paymentMethod,
                status: "PENDING",
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Update product stock
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message,
        });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber } = req.body;

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                status,
                trackingNumber,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update order",
            error: error.message,
        });
    }
};
