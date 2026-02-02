import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all products with pagination, search, and filters
export const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            inStock,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build where clause
        let where = {};

        // Search across name, category, and description
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Category filter
        if (category) {
            where.category = { contains: category, mode: 'insensitive' };
        }

        // Stock filter
        if (inStock !== undefined) {
            where.stock = inStock === 'true' ? { gt: 0 } : { equals: 0 };
        }

        // Price filter
        if (req.query.minPrice || req.query.maxPrice) {
            where.price = {};
            if (req.query.minPrice) {
                where.price.gte = parseInt(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                where.price.lte = parseInt(req.query.maxPrice);
            }
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const total = await prisma.product.count({ where });

        // Get products with pagination
        const products = await prisma.product.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { [sortBy]: order }
        });

        res.json({
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        console.log("DEBUG: createProduct called with body:", req.body);
        const { name, description, price, stock, category } = req.body;
        const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

        if (!name || !price || !stock) {
            return res.status(400).json({ message: "Name, price, and stock are required" });
        }

        const parsedPrice = parseInt(price);
        const parsedStock = parseInt(stock);

        if (isNaN(parsedPrice) || isNaN(parsedStock)) {
            return res.status(400).json({ message: "Price and stock must be valid numbers" });
        }

        const productData = {
            name,
            description: description || '',
            price: parsedPrice,
            stock: parsedStock,
            category: category || null,
            images
        };
        console.log("DEBUG: Prisma creation payload:", productData);

        const product = await prisma.product.create({
            data: productData
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category } = req.body;

        let updateData = {
            name,
            description,
            price: price ? parseInt(price) : undefined,
            stock: stock ? parseInt(stock) : undefined,
            category
        };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => `/uploads/products/${file.filename}`);
        }

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
