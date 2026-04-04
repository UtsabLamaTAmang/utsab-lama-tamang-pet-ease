import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        // Parallel queries for performance
        const [
            totalUsers,
            totalDoctors,
            totalProducts,
            totalPets,
            totalRescueMissions,
            verifyPendingDoctors
        ] = await Promise.all([
            prisma.user.count({
                where: { role: 'USER' }
            }),
            prisma.doctor.count({
                where: { verificationStatus: 'APPROVED' }
            }),
            prisma.product.count(),
            prisma.pet.count(),
            prisma.rescueMission.count(),
            prisma.doctor.count({
                where: { verificationStatus: 'PENDING' }
            })
        ]);

        // Calculate revenue (sum of all completed order payments)
        const totalRevenue = await prisma.payment.aggregate({
            where: { status: 'SUCCESS' },
            _sum: { amount: true }
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalDoctors,
                totalProducts,
                totalPets,
                totalRescueMissions,
                verifyPendingDoctors,
                totalRevenue: totalRevenue._sum.amount || 0
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};

// Get all users for admin (with pagination and search)
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const role = req.query.role || "";

        const skip = (page - 1) * limit;

        const whereClause = {
            AND: [
                search ? {
                    OR: [
                        { fullName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                role ? { role } : {}
            ]
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    isVerified: true,
                    points: true,
                    createdAt: true,
                    userBadges: {
                        include: {
                            badge: true
                        }
                    },
                    _count: {
                        select: {
                            rescueReports: true,
                            rescueMissions: true,
                            pets: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ["USER", "ADMIN", "DOCTOR", "RESCUER"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true
            }
        });

        res.json({ success: true, message: `User role updated to ${role}`, data: user });
    } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user role",
            error: error.message
        });
    }
};

// Toggle user verification status (Activation/Deactivation)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        if (typeof isVerified !== "boolean") {
            return res.status(400).json({ success: false, message: "isVerified must be a boolean" });
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { isVerified },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isVerified: true
            }
        });

        const statusMessage = isVerified ? "activated" : "deactivated";
        res.json({ success: true, message: `User account ${statusMessage} successfully`, data: user });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify/unverify user",
            error: error.message
        });
    }
};
