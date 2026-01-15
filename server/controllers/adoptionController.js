import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create adoption request
export const createAdoptionRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { petId, reason, experience, livingSpace, hasOtherPets } = req.body;

        // Validation
        if (!petId || !reason) {
            return res.status(400).json({
                success: false,
                message: "Pet ID and reason are required",
            });
        }

        // Check if pet exists and is available
        const pet = await prisma.pet.findUnique({
            where: { id: parseInt(petId) },
        });

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        if (pet.status === 'ADOPTED') {
            return res.status(400).json({
                success: false,
                message: "Pet is already adopted",
            });
        }

        // Check if user already has a pending request for this pet
        const existingRequest = await prisma.adoptionRequest.findFirst({
            where: {
                userId,
                petId: parseInt(petId),
                status: "PENDING",
            },
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending request for this pet",
            });
        }

        const adoptionRequest = await prisma.adoptionRequest.create({
            data: {
                userId,
                petId: parseInt(petId),
                reason,
                experience,
                livingSpace,
                hasOtherPets: hasOtherPets === true || hasOtherPets === "true",
                status: "PENDING",
            },
            include: {
                pet: true,
                user: {
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
            message: "Adoption request submitted successfully",
            data: adoptionRequest,
        });
    } catch (error) {
        console.error("Create adoption request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create adoption request",
            error: error.message,
        });
    }
};

// Get all adoption requests (admin) or user's requests
export const getAdoptionRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status, petId } = req.query;

        const where = {};

        // If not admin, only show user's own requests
        if (userRole !== "ADMIN") {
            if (req.query.type === 'received') {
                // Find requests for pets owned by this user
                where.pet = {
                    ownerId: userId
                };
            } else {
                // Default: Find requests MADE by this user
                where.userId = userId;
            }
        }

        if (status) where.status = status;
        if (petId) where.petId = parseInt(petId);

        const requests = await prisma.adoptionRequest.findMany({
            where,
            include: {
                pet: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                chat: {
                    select: { id: true }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: requests,
            count: requests.length,
        });
    } catch (error) {
        console.error("Get adoption requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch adoption requests",
            error: error.message,
        });
    }
};

// Get single adoption request
export const getAdoptionRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const request = await prisma.adoptionRequest.findUnique({
            where: { id: parseInt(id) },
            include: {
                pet: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                chat: {
                    select: { id: true }
                },
            },
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Adoption request not found",
            });
        }

        // Check authorization
        if (request.userId !== userId && userRole !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this request",
            });
        }

        res.json({
            success: true,
            data: request,
        });
    } catch (error) {
        console.error("Get adoption request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch adoption request",
            error: error.message,
        });
    }
};

// Update adoption request status (admin only)
export const updateAdoptionRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!["APPROVED", "REJECTED", "COMPLETED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        const request = await prisma.adoptionRequest.findUnique({
            where: { id: parseInt(id) },
            include: { pet: true },
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Adoption request not found",
            });
        }

        const userId = req.user.id;
        const userRole = req.user.role;

        // Authorization: Admin or Pet Owner
        if (userRole !== 'ADMIN' && request.pet.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this request",
            });
        }

        // Update request
        const updatedRequest = await prisma.adoptionRequest.update({
            where: { id: parseInt(id) },
            data: {
                status,
                adminNotes,
                reviewedAt: new Date(),
            },
            include: {
                pet: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        // If approved, update pet status
        if (status === "APPROVED") {
            await prisma.pet.update({
                where: { id: request.petId },
                data: { status: "RESERVED" },
            });
        }

        // If completed, update pet status to adopted
        if (status === "COMPLETED") {
            await prisma.pet.update({
                where: { id: request.petId },
                data: { status: "ADOPTED" },
            });
        }

        res.json({
            success: true,
            message: `Adoption request ${status.toLowerCase()} successfully`,
            data: updatedRequest,
        });
    } catch (error) {
        console.error("Update adoption request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update adoption request",
            error: error.message,
        });
    }
};

// Cancel adoption request (user)
export const cancelAdoptionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const request = await prisma.adoptionRequest.findUnique({
            where: { id: parseInt(id) },
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Adoption request not found",
            });
        }

        if (request.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this request",
            });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Can only cancel pending requests",
            });
        }

        await prisma.adoptionRequest.update({
            where: { id: parseInt(id) },
            data: { status: "CANCELLED" },
        });

        res.json({
            success: true,
            message: "Adoption request cancelled successfully",
        });
    } catch (error) {
        console.error("Cancel adoption request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel adoption request",
            error: error.message,
        });
    }
};
