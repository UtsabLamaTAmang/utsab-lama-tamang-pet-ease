import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all pets with filters
export const getAllPets = async (req, res) => {
    try {
        const { status, species, breed, minAge, maxAge, search, lat, lng } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        } else {
            // By default, show AVAILABLE and PENDING, but hide ADOPTED
            where.status = { not: "ADOPTED" };
        }
        if (species && species !== "ALL") {
            where.species = { equals: species, mode: "insensitive" };
        }
        if (breed) where.breed = { contains: breed, mode: "insensitive" };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { breed: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } }, // Allow searching address in main search too
            ];
        }

        // Specific location filter
        if (req.query.location) {
            where.address = { contains: req.query.location, mode: "insensitive" };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const total = await prisma.pet.count({ where });

        const pets = await prisma.pet.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                adoptionRequests: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        });

        let resultPets = [...pets];

        // Map-based priority: Sort by distance if user location is provided
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            resultPets = resultPets.map(pet => {
                let distance = Infinity;
                if (pet.latitude && pet.longitude) {
                    // Haversine formula
                    const R = 6371; // Radius of the earth in km
                    const dLat = deg2rad(pet.latitude - userLat);
                    const dLon = deg2rad(pet.longitude - userLng);
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(pet.latitude)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    distance = R * c; // Distance in km
                }
                return { ...pet, distance };
            });

            // Sort by distance (nearest first)
            // If distance is Infinity (no location), put at bottom
            resultPets.sort((a, b) => a.distance - b.distance);
        }

        res.json({
            success: true,
            data: resultPets,
            pagination: {
                total,
                page: parseInt(req.query.page) || 1,
                pages: Math.ceil(total / (parseInt(req.query.limit) || 9))
            },
            count: resultPets.length,
        });
    } catch (error) {
        console.error("Get pets error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pets",
            error: error.message,
        });
    }
};

// Get single pet by ID
export const getPetById = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await prisma.pet.findUnique({
            where: { id: parseInt(id) },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                adoptionRequests: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        res.json({
            success: true,
            data: pet,
        });
    } catch (error) {
        console.error("Get pet error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pet",
            error: error.message,
        });
    }
};

// Create new pet (for giving away)
export const createPet = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            species,
            breed,
            age,
            gender,
            size,
            color,
            description,
            healthStatus,
            vaccinated,
            neutered,
            location, // Keeping this for backward compatibility or general text
            latitude,
            longitude,
            address,
            images,
        } = req.body;

        // Validation
        if (!name || !species || !breed || !age) {
            return res.status(400).json({
                success: false,
                message: "Name, species, breed, and age are required",
            });
        }

        const pet = await prisma.pet.create({
            data: {
                name,
                species,
                breed,
                age: parseInt(age),
                gender,
                size,
                color,
                description,
                healthStatus,
                healthStatus,
                isVaccinated: vaccinated === true || vaccinated === "true",
                neutered: neutered === true || neutered === "true",
                adoptionFee: req.body.adoptionFee ? parseInt(req.body.adoptionFee) : 0,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                address,
                images: images || [],
                imageUrl: (images && images.length > 0) ? images[0] : null,
                status: "PENDING", // Admin needs to approve, but users can still apply
                ownerId: userId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Pet submitted for approval",
            data: pet,
        });
    } catch (error) {
        console.error("Create pet error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create pet",
            error: error.message,
        });
    }
};

// Update pet (owner or admin)
export const updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const pet = await prisma.pet.findUnique({
            where: { id: parseInt(id) },
        });

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        // Check authorization
        if (pet.ownerId !== userId && userRole !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this pet",
            });
        }

        const updatedPet = await prisma.pet.update({
            where: { id: parseInt(id) },
            data: req.body,
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Pet updated successfully",
            data: updatedPet,
        });
    } catch (error) {
        console.error("Update pet error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update pet",
            error: error.message,
        });
    }
};

// Delete pet (owner or admin)
export const deletePet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const pet = await prisma.pet.findUnique({
            where: { id: parseInt(id) },
        });

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        // Check authorization
        if (pet.ownerId !== userId && userRole !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this pet",
            });
        }

        await prisma.pet.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            success: true,
            message: "Pet deleted successfully",
        });
    } catch (error) {
        console.error("Delete pet error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete pet",
            error: error.message,
        });
    }
};

// Approve pet (admin only)
export const approvePet = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await prisma.pet.update({
            where: { id: parseInt(id) },
            data: {
                status: "AVAILABLE",
            },
        });

        res.json({
            success: true,
            message: "Pet approved successfully",
            data: pet,
        });
    } catch (error) {
        console.error("Approve pet error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve pet",
            error: error.message,
        });
    }
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
