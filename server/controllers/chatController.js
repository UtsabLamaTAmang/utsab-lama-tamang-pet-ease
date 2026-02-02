import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initiate a chat for a specific pet (creates AdoptionRequest if needed)
export const initiateChat = async (req, res) => {
    try {
        const { petId } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!petId) {
            return res.status(400).json({ success: false, message: "Pet ID is required" });
        }

        // 1. Check if an Adoption Request already exists for this user and pet
        let adoptionRequest = await prisma.adoptionRequest.findFirst({
            where: {
                petId: parseInt(petId),
                userId: userId,
            },
            include: {
                chat: true
            }
        });

        // 2. If not, create a new Adoption Request (status: PENDING or INQUIRY)
        if (!adoptionRequest) {
            adoptionRequest = await prisma.adoptionRequest.create({
                data: {
                    petId: parseInt(petId),
                    userId: userId,
                    status: "PENDING", // Initial status
                },
                include: {
                    chat: true
                }
            });
        }

        // 3. Check if a Chat exists for this Adoption Request
        let chat = adoptionRequest.chat;

        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    adoptionRequestId: adoptionRequest.id,
                }
            });
        }

        // 4. Return the Chat ID and basic info
        res.json({
            success: true,
            data: {
                chatId: chat.id,
                adoptionRequestId: adoptionRequest.id,
                petId: parseInt(petId)
            }
        });

    } catch (error) {
        console.error("Initiate chat error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate chat",
            error: error.message
        });
    }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const chat = await prisma.chat.findUnique({
            where: { id: parseInt(chatId) },
            include: {
                messages: {
                    include: {
                        sender: {
                            select: { id: true, fullName: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                adoptionRequest: {
                    include: {
                        pet: { select: { ownerId: true } },
                        user: { select: { id: true } }
                    }
                },
                consultation: {
                    include: {
                        user: { select: { id: true } },
                        doctor: {
                            include: {
                                user: { select: { id: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Security check: Only allow participants
        const petOwnerId = chat.adoptionRequest?.pet?.ownerId;
        const adopterId = chat.adoptionRequest?.user?.id;

        const consultationPatientId = chat.consultation?.user?.id;
        const consultationDoctorUserId = chat.consultation?.doctor?.user?.id;

        const isAdoptionParticipant = userId === petOwnerId || userId === adopterId;
        const isConsultationParticipant = userId === consultationPatientId || userId === consultationDoctorUserId;

        if (!isAdoptionParticipant && !isConsultationParticipant) {
            return res.status(403).json({ success: false, message: "Unauthorized access to this chat" });
        }

        res.json({
            success: true,
            data: chat
        });

    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
            error: error.message
        });
    }
};

// Get all chats for the current user
export const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;

        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    {
                        adoptionRequest: {
                            OR: [
                                { userId: userId },
                                { pet: { ownerId: userId } }
                            ]
                        }
                    },
                    {
                        consultation: {
                            OR: [
                                { userId: userId },
                                { doctor: { userId: userId } }
                            ]
                        }
                    }
                ]
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                adoptionRequest: {
                    include: {
                        pet: {
                            include: {
                                owner: { select: { id: true, fullName: true } }
                            }
                        },
                        user: { select: { id: true, fullName: true } }
                    }
                },
                consultation: {
                    include: {
                        user: { select: { id: true, fullName: true, imageUrl: true } },
                        doctor: {
                            include: {
                                user: { select: { id: true, fullName: true, imageUrl: true } }
                            }
                        }
                    }
                }
            }
        });

        // Format for frontend
        const formattedChats = chats.map(chat => {
            let petName = "Unknown";
            let petImage = null;
            let otherUser = { id: 0, fullName: "Unknown", role: "" };

            if (chat.adoptionRequest) {
                const isOwner = chat.adoptionRequest.pet.ownerId === userId;
                otherUser = isOwner ? chat.adoptionRequest.user : chat.adoptionRequest.pet.owner;
                otherUser.role = isOwner ? "Adopter" : "Owner";
                petName = chat.adoptionRequest.pet.name;
                petImage = chat.adoptionRequest.pet.imageUrl;
            } else if (chat.consultation) {
                const isDoctor = chat.consultation.doctor.user.id === userId;
                otherUser = isDoctor ? chat.consultation.user : chat.consultation.doctor.user;
                otherUser.role = isDoctor ? "Patient" : "Doctor";
                petName = isDoctor ? "Patient Consultation" : "Doctor Consultation";
                petImage = isDoctor ? chat.consultation.user.imageUrl : chat.consultation.doctor.user.imageUrl;
            }

            return {
                id: chat.id,
                petName,
                petImage,
                otherParticipant: {
                    id: otherUser.id,
                    fullName: otherUser.fullName,
                    role: otherUser.role
                },
                lastMessage: chat.messages[0] ? {
                    text: chat.messages[0].messageText,
                    createdAt: chat.messages[0].createdAt
                } : null,
                updatedAt: chat.messages[0]?.createdAt || chat.createdAt
            };
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.json({
            success: true,
            data: formattedChats
        });

    } catch (error) {
        console.error("Get user chats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch chats"
        });
    }
};
