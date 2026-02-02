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
