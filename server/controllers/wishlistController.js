import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Toggle item in wishlist (Pet or Product)
export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { petId, productId } = req.body;

        if (!petId && !productId) {
            return res.status(400).json({ success: false, message: "Pet ID or Product ID is required" });
        }

        // Logic for Pets
        if (petId) {
            const existing = await prisma.wishlist.findFirst({
                where: {
                    userId: userId,
                    petId: parseInt(petId)
                }
            });

            if (existing) {
                await prisma.wishlist.delete({ where: { id: existing.id } });
                return res.json({ success: true, message: "Removed from favorites", action: "removed" });
            } else {
                await prisma.wishlist.create({
                    data: {
                        userId: userId,
                        petId: parseInt(petId)
                    }
                });
                return res.json({ success: true, message: "Added to favorites", action: "added" });
            }
        }

        // Logic for Products
        if (productId) {
            const existing = await prisma.wishlist.findFirst({
                where: {
                    userId: userId,
                    productId: parseInt(productId)
                }
            });

            if (existing) {
                await prisma.wishlist.delete({ where: { id: existing.id } });
                return res.json({ success: true, message: "Removed from wishlist", action: "removed" });
            } else {
                await prisma.wishlist.create({
                    data: {
                        userId: userId,
                        productId: parseInt(productId)
                    }
                });
                return res.json({ success: true, message: "Added to wishlist", action: "added" });
            }
        }

    } catch (error) {
        console.error("Toggle wishlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update wishlist",
            error: error.message
        });
    }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: userId },
            include: {
                pet: true,
                product: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        console.error("Get wishlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
            error: error.message
        });
    }
};

// Check status for a specific item
export const checkWishlistStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { petId, productId } = req.query;

        if (petId) {
            const exists = await prisma.wishlist.findFirst({
                where: { userId, petId: parseInt(petId) }
            });
            return res.json({ success: true, isFavorited: !!exists });
        }

        if (productId) {
            const exists = await prisma.wishlist.findFirst({
                where: { userId, productId: parseInt(productId) }
            });
            return res.json({ success: true, isFavorited: !!exists });
        }

        res.json({ success: true, isFavorited: false });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
