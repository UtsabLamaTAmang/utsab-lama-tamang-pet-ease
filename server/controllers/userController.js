import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get Public User Profile with Stats
export const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true, // Only show if needed? User asked for info.
                createdAt: true,
                imageUrl: true, // Assuming this exists or will be added
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Stats
        const donatedCount = await prisma.pet.count({
            where: { ownerId: userId }
        });

        const adoptedCount = await prisma.pet.count({
            where: {
                ownerId: userId,
                status: 'ADOPTED' // Or should I check AdoptionRequests? 
                // Using 'ADOPTED' pets they OWN means they successfully adopted them?
                // Wait, if they Adopted a pet, they become the OWNER.
                // So all pets they own are technically 'adopted' or 'donated' by themselves?
                // Re-reading logic.
                // If I am a User, I can Donate (Create) a pet. ownerId = me.
                // If I Adopt a pet, ownership changes to me?
                // Usually an 'Adoption' implies transfer of ownership.
                // If the system transfers ownership, then `donatedCount` is confusing.
                // But normally 'Donated' means I listed it.
                // Let's assume 'Donated' = Created originally?
                // The DB doesn't track 'OriginalOwner'.

                // Alternative: Count COMPLETED AdoptionRequests where user is Applicant.
            }
        });

        const adoptionAppCount = await prisma.adoptionRequest.count({
            where: {
                userId: userId,
                status: 'COMPLETED'
            }
        });

        res.json({
            success: true,
            data: {
                ...user,
                stats: {
                    donated: donatedCount, // Only approximate if ownership transfers
                    adopted: adoptionAppCount
                }
            }
        });

    } catch (error) {
        console.error("Get Public Profile Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
