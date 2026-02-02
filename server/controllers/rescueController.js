import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Report a rescue case
export const reportRescue = async (req, res) => {
    try {
        const reporterId = req.user.id;
        const {
            petType,
            location,
            description,
            urgency,
            contactNumber,
            images,
        } = req.body;

        if (!petType || !location || !description) {
            return res.status(400).json({
                success: false,
                message: "Pet type, location, and description are required",
            });
        }

        const report = await prisma.rescueReport.create({
            data: {
                reporterId,
                petType,
                location,
                description,
                urgency: urgency || "MEDIUM",
                contactNumber,
                images: images || [],
                status: "PENDING",
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
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
        res.status(500).json({
            success: false,
            message: "Failed to submit rescue report",
            error: error.message,
        });
    }
};

// Get all rescue reports (admin) or user's reports
export const getRescueReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status, urgency } = req.query;

        const where = {};

        // If not admin, only show user's own reports
        if (userRole !== "ADMIN") {
            where.reporterId = userId;
        }

        if (status) where.status = status;
        if (urgency) where.urgency = urgency;

        const reports = await prisma.rescueReport.findMany({
            where,
            include: {
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                mission: {
                    include: {
                        rescuer: {
                            select: {
                                id: true,
                                fullName: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { urgency: "desc" }, // High urgency first
                { createdAt: "desc" },
            ],
        });

        res.json({
            success: true,
            data: reports,
        });
    } catch (error) {
        console.error("Get rescue reports error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rescue reports",
            error: error.message,
        });
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
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                mission: {
                    include: {
                        rescuer: {
                            select: {
                                id: true,
                                fullName: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Rescue report not found",
            });
        }

        // Check authorization
        if (report.reporterId !== userId && userRole !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this report",
            });
        }

        res.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error("Get rescue report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rescue report",
            error: error.message,
        });
    }
};

// Create rescue mission (admin only)
export const createRescueMission = async (req, res) => {
    try {
        const { reportId, rescuerId, scheduledAt, notes } = req.body;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "Report ID is required",
            });
        }

        // Check if report exists
        const report = await prisma.rescueReport.findUnique({
            where: { id: parseInt(reportId) },
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Rescue report not found",
            });
        }

        // Check if mission already exists for this report
        const existingMission = await prisma.rescueMission.findFirst({
            where: { reportId: parseInt(reportId) },
        });

        if (existingMission) {
            return res.status(400).json({
                success: false,
                message: "Mission already exists for this report",
            });
        }

        const mission = await prisma.rescueMission.create({
            data: {
                reportId: parseInt(reportId),
                rescuerId: rescuerId ? parseInt(rescuerId) : null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                notes,
                status: "ASSIGNED",
            },
            include: {
                report: true,
                rescuer: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
            },
        });

        // Update report status
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
        res.status(500).json({
            success: false,
            message: "Failed to create rescue mission",
            error: error.message,
        });
    }
};

// Update rescue mission status (admin or assigned rescuer)
export const updateRescueMissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, outcome, notes } = req.body;

        const mission = await prisma.rescueMission.update({
            where: { id: parseInt(id) },
            data: {
                status,
                outcome,
                notes,
                completedAt: status === "COMPLETED" ? new Date() : null,
            },
            include: {
                report: true,
                rescuer: {
                    select: {
                        fullName: true,
                    },
                },
            },
        });

        // Update report status based on mission status
        if (status === "COMPLETED") {
            await prisma.rescueReport.update({
                where: { id: mission.reportId },
                data: { status: "RESOLVED" },
            });
        }

        res.json({
            success: true,
            message: "Rescue mission updated successfully",
            data: mission,
        });
    } catch (error) {
        console.error("Update rescue mission error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update rescue mission",
            error: error.message,
        });
    }
};

// Get all rescue missions (admin)
export const getRescueMissions = async (req, res) => {
    try {
        const { status } = req.query;

        const where = {};
        if (status) where.status = status;

        const missions = await prisma.rescueMission.findMany({
            where,
            include: {
                report: {
                    include: {
                        reporter: {
                            select: {
                                fullName: true,
                                phone: true,
                            },
                        },
                    },
                },
                rescuer: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: missions,
        });
    } catch (error) {
        console.error("Get rescue missions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rescue missions",
            error: error.message,
        });
    }
};
