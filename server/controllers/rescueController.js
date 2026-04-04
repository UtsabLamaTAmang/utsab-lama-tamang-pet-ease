import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =====================
// REPORTS
// =====================

// Report a rescue case (any user)
export const reportRescue = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const { petType, location, description, urgency, contactNumber, images } = req.body;

        if (!location || !description) {
            return res.status(400).json({
                success: false,
                message: "Location and description are required",
            });
        }

        const report = await prisma.rescueReport.create({
            data: {
                reporterId,
                petType: petType || null,
                location,
                description,
                urgency: urgency || "MEDIUM",
                contactNumber: contactNumber || null,
                images: images || [],
                status: "PENDING",
            },
            include: {
                reporter: {
                    select: { id: true, fullName: true, email: true, phone: true },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Rescue report submitted successfully",
            data: report,
        });
    } catch (error) {
        console.error("Report rescue error:", error);
        res.status(500).json({ success: false, message: "Failed to submit rescue report", error: error.message });
    }
};

// Get all rescue reports (admin sees all, user sees own)
export const getRescueReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status, urgency } = req.query;

        const where = {};
        if (userRole !== "ADMIN" && userRole !== "RESCUER") {
            where.reporterId = userId;
        }
        if (status) where.status = status;
        if (urgency) where.urgency = urgency;

        const reports = await prisma.rescueReport.findMany({
            where,
            include: {
                reporter: {
                    select: { id: true, fullName: true, email: true, phone: true },
                },
                mission: {
                    include: {
                        rescuer: {
                            select: { id: true, fullName: true, phone: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, data: reports });
    } catch (error) {
        console.error("Get rescue reports error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch rescue reports", error: error.message });
    }
};

// Get single rescue report
export const getRescueReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const report = await prisma.rescueReport.findUnique({
            where: { id: parseInt(id) },
            include: {
                reporter: {
                    select: { id: true, fullName: true, email: true, phone: true },
                },
                mission: {
                    include: {
                        rescuer: {
                            select: { id: true, fullName: true, phone: true },
                        },
                    },
                },
            },
        });

        if (!report) {
            return res.status(404).json({ success: false, message: "Rescue report not found" });
        }

        if (report.reporterId !== userId && userRole !== "ADMIN" && userRole !== "RESCUER") {
            return res.status(403).json({ success: false, message: "Not authorized to view this report" });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        console.error("Get rescue report error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch rescue report", error: error.message });
    }
};

// Get available reports for rescuers (PENDING only)
export const getAvailableReports = async (req, res) => {
    try {
        const reports = await prisma.rescueReport.findMany({
            where: { status: "PENDING" },
            include: {
                reporter: {
                    select: { id: true, fullName: true, phone: true },
                },
            },
            orderBy: [{ createdAt: "desc" }],
        });

        res.json({ success: true, data: reports });
    } catch (error) {
        console.error("Get available reports error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch available reports", error: error.message });
    }
};

// =====================
// MISSIONS
// =====================

// Accept a rescue mission (rescuer self-assigns)
export const acceptMission = async (req, res) => {
    try {
        const { id } = req.params; // report id
        const rescuerId = req.user.id;

        const report = await prisma.rescueReport.findUnique({
            where: { id: parseInt(id) },
            include: { mission: true },
        });

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        if (report.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "This report has already been claimed" });
        }

        if (report.mission) {
            return res.status(400).json({ success: false, message: "Mission already exists for this report" });
        }

        // Create mission and update report status in a transaction
        const [mission] = await prisma.$transaction([
            prisma.rescueMission.create({
                data: {
                    reportId: parseInt(id),
                    rescuerId,
                    status: "IN_PROGRESS",
                    rescueReports: { connect: { id: parseInt(id) } },
                },
                include: {
                    rescuer: { select: { id: true, fullName: true, phone: true } },
                    rescueReports: true,
                },
            }),
            prisma.rescueReport.update({
                where: { id: parseInt(id) },
                data: { status: "IN_PROGRESS" },
            }),
        ]);

        res.status(201).json({
            success: true,
            message: "Mission accepted! Head to the rescue location.",
            data: mission,
        });
    } catch (error) {
        console.error("Accept mission error:", error);
        res.status(500).json({ success: false, message: "Failed to accept mission", error: error.message });
    }
};

// Get rescuer's missions
export const getMyMissions = async (req, res) => {
    try {
        const rescuerId = req.user.id;
        const { status } = req.query;

        const where = { rescuerId };
        if (status) where.status = status;

        const missions = await prisma.rescueMission.findMany({
            where,
            include: {
                rescueReports: {
                    include: {
                        reporter: {
                            select: { id: true, fullName: true, phone: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, data: missions });
    } catch (error) {
        console.error("Get my missions error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch missions", error: error.message });
    }
};

// Complete a mission (rescuer marks as done)
export const completeMission = async (req, res) => {
    try {
        const { id } = req.params;
        const rescuerId = req.user.id;
        const { notes, outcome } = req.body;

        const mission = await prisma.rescueMission.findUnique({
            where: { id: parseInt(id) },
        });

        if (!mission) {
            return res.status(404).json({ success: false, message: "Mission not found" });
        }

        if (mission.rescuerId !== rescuerId && req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (mission.status === "RESCUED" || mission.status === "CLOSED") {
            return res.status(400).json({ success: false, message: "Mission already completed" });
        }

        // First fetch the mission with reports to know who to reward
        const missionWithReports = await prisma.rescueMission.findUnique({
            where: { id: parseInt(id) },
            include: { rescueReports: true },
        });

        // Update mission and report in transaction
        const [updatedMission] = await prisma.$transaction([
            prisma.rescueMission.update({
                where: { id: parseInt(id) },
                data: {
                    status: "RESCUED",
                    notes: notes || mission.notes,
                },
                include: {
                    rescuer: { select: { id: true, fullName: true } },
                    rescueReports: true,
                },
            }),
            prisma.rescueReport.updateMany({
                where: { rescueMissionId: parseInt(id) },
                data: { status: "RESOLVED" },
            }),
        ]);

        // Reward points to reporters
        if (missionWithReports && missionWithReports.rescueReports.length > 0) {
            for (const report of missionWithReports.rescueReports) {
                if (report.reporterId) {
                    await prisma.user.update({
                        where: { id: report.reporterId },
                        data: {
                            points: { increment: 50 } // Give 50 points for a successful rescue submission
                        }
                    });
                }
            }
        }

        // Award badges to rescuer
        await checkAndAwardBadges(rescuerId);

        res.json({
            success: true,
            message: "Mission completed! Thank you for rescuing! Reporters have been awarded points.",
            data: updatedMission,
        });
    } catch (error) {
        console.error("Complete mission error:", error);
        res.status(500).json({ success: false, message: "Failed to complete mission", error: error.message });
    }
};

// Admin: create mission and assign to rescuer
export const createRescueMission = async (req, res) => {
    try {
        const { reportId, rescuerId, notes } = req.body;

        if (!reportId) {
            return res.status(400).json({ success: false, message: "Report ID is required" });
        }

        const report = await prisma.rescueReport.findUnique({
            where: { id: parseInt(reportId) },
        });

        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        const existingMission = await prisma.rescueMission.findFirst({
            where: { reportId: parseInt(reportId) },
        });

        if (existingMission) {
            return res.status(400).json({ success: false, message: "Mission already exists for this report" });
        }

        const mission = await prisma.rescueMission.create({
            data: {
                reportId: parseInt(reportId),
                rescuerId: rescuerId ? parseInt(rescuerId) : null,
                notes,
                status: "ASSIGNED",
                rescueReports: { connect: { id: parseInt(reportId) } },
            },
            include: {
                rescuer: { select: { id: true, fullName: true, phone: true } },
                rescueReports: true,
            },
        });

        await prisma.rescueReport.update({
            where: { id: parseInt(reportId) },
            data: { status: "IN_PROGRESS" },
        });

        res.status(201).json({
            success: true,
            message: "Rescue mission created successfully",
            data: mission,
        });
    } catch (error) {
        console.error("Create rescue mission error:", error);
        res.status(500).json({ success: false, message: "Failed to create rescue mission", error: error.message });
    }
};

// Admin: update mission status
export const updateRescueMissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const mission = await prisma.rescueMission.update({
            where: { id: parseInt(id) },
            data: { status, notes },
            include: {
                rescuer: { select: { fullName: true } },
                rescueReports: true,
            },
        });

        if (status === "RESCUED" || status === "CLOSED") {
            await prisma.rescueReport.updateMany({
                where: { rescueMissionId: parseInt(id) },
                data: { status: status === "RESCUED" ? "RESOLVED" : "CLOSED" },
            });

            if (status === "RESCUED" && mission.rescuerId) {
                await checkAndAwardBadges(mission.rescuerId);
            }
        }

        res.json({ success: true, message: "Mission updated", data: mission });
    } catch (error) {
        console.error("Update mission error:", error);
        res.status(500).json({ success: false, message: "Failed to update mission", error: error.message });
    }
};

// Admin: get all missions
export const getRescueMissions = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const missions = await prisma.rescueMission.findMany({
            where,
            include: {
                rescueReports: {
                    include: {
                        reporter: { select: { fullName: true, phone: true } },
                    },
                },
                rescuer: { select: { id: true, fullName: true, phone: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, data: missions });
    } catch (error) {
        console.error("Get missions error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch missions", error: error.message });
    }
};

// =====================
// BADGES
// =====================

// Check and award badges after a rescue
async function checkAndAwardBadges(rescuerId) {
    try {
        const completedCount = await prisma.rescueMission.count({
            where: { rescuerId, status: "RESCUED" },
        });

        const badges = await prisma.badge.findMany({
            where: { threshold: { lte: completedCount } },
        });

        for (const badge of badges) {
            await prisma.userBadge.upsert({
                where: { userId_badgeId: { userId: rescuerId, badgeId: badge.id } },
                create: { userId: rescuerId, badgeId: badge.id },
                update: {},
            });
        }
    } catch (error) {
        console.error("Badge check error:", error);
    }
}

// Get user's badges
export const getUserBadges = async (req, res) => {
    try {
        const userId = req.user.id;

        const [userBadges, allBadges, completedCount] = await Promise.all([
            prisma.userBadge.findMany({
                where: { userId },
                include: { badge: true },
            }),
            prisma.badge.findMany({ orderBy: { threshold: "asc" } }),
            prisma.rescueMission.count({
                where: { rescuerId: userId, status: "RESCUED" },
            }),
        ]);

        const earnedIds = new Set(userBadges.map((ub) => ub.badgeId));

        const badges = allBadges.map((badge) => ({
            ...badge,
            earned: earnedIds.has(badge.id),
            earnedAt: userBadges.find((ub) => ub.badgeId === badge.id)?.earnedAt || null,
        }));

        res.json({
            success: true,
            data: {
                badges,
                totalRescues: completedCount,
                earnedCount: userBadges.length,
            },
        });
    } catch (error) {
        console.error("Get badges error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch badges", error: error.message });
    }
};

// Seed default badges (call once)
export const seedBadges = async (req, res) => {
    try {
        const defaultBadges = [
            { name: "First Responder", description: "Completed your first rescue mission", icon: "🏅", threshold: 1 },
            { name: "Guardian", description: "Completed 5 rescue missions", icon: "🛡️", threshold: 5 },
            { name: "Hero", description: "Completed 10 rescue missions", icon: "🦸", threshold: 10 },
            { name: "Legend", description: "Completed 25 rescue missions", icon: "⭐", threshold: 25 },
            { name: "Champion", description: "Completed 50 rescue missions", icon: "🏆", threshold: 50 },
        ];

        for (const badge of defaultBadges) {
            await prisma.badge.upsert({
                where: { name: badge.name },
                create: badge,
                update: badge,
            });
        }

        res.json({ success: true, message: "Badges seeded successfully" });
    } catch (error) {
        console.error("Seed badges error:", error);
        res.status(500).json({ success: false, message: "Failed to seed badges", error: error.message });
    }
};

// Rescuer stats
export const getRescuerStats = async (req, res) => {
    try {
        const rescuerId = req.user.id;

        const [total, completed, inProgress, badgeCount] = await Promise.all([
            prisma.rescueMission.count({ where: { rescuerId } }),
            prisma.rescueMission.count({ where: { rescuerId, status: "RESCUED" } }),
            prisma.rescueMission.count({ where: { rescuerId, status: "IN_PROGRESS" } }),
            prisma.userBadge.count({ where: { userId: rescuerId } }),
        ]);

        res.json({
            success: true,
            data: { total, completed, inProgress, badgeCount },
        });
    } catch (error) {
        console.error("Rescuer stats error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch stats", error: error.message });
    }
};
