import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all events
export const getAllEvents = async (req, res) => {
    try {
        const { upcoming, category } = req.query;

        const where = {};
        if (category) where.category = category;
        if (upcoming === "true") {
            where.eventDate = {
                gte: new Date(),
            };
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                registrations: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                eventDate: "asc",
            },
        });

        // Add registration count
        const eventsWithCount = events.map((event) => ({
            ...event,
            registeredCount: event.registrations.filter(
                (r) => r.status === "CONFIRMED"
            ).length,
        }));

        res.json({
            success: true,
            data: eventsWithCount,
        });
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch events",
            error: error.message,
        });
    }
};

// Get single event
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: {
                registrations: {
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

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error("Get event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch event",
            error: error.message,
        });
    }
};

// Create event (admin only)
export const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            eventDate,
            location,
            category,
            maxParticipants,
            registrationFee,
            coverImage,
        } = req.body;

        if (!title || !eventDate || !location) {
            return res.status(400).json({
                success: false,
                message: "Title, event date, and location are required",
            });
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                eventDate: new Date(eventDate),
                location,
                category,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
                registrationFee: registrationFee ? parseFloat(registrationFee) : 0,
                coverImage,
            },
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event,
        });
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create event",
            error: error.message,
        });
    }
};

// Update event (admin only)
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.update({
            where: { id: parseInt(id) },
            data: req.body,
        });

        res.json({
            success: true,
            message: "Event updated successfully",
            data: event,
        });
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update event",
            error: error.message,
        });
    }
};

// Delete event (admin only)
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.event.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete event",
            error: error.message,
        });
    }
};

// Register for event
export const registerForEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId, numberOfGuests, specialRequests } = req.body;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Event ID is required",
            });
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: parseInt(eventId) },
            include: {
                registrations: {
                    where: {
                        status: "CONFIRMED",
                    },
                },
            },
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Check if event is full
        if (
            event.maxParticipants &&
            event.registrations.length >= event.maxParticipants
        ) {
            return res.status(400).json({
                success: false,
                message: "Event is full",
            });
        }

        // Check if user already registered
        const existingRegistration = await prisma.eventRegistration.findFirst({
            where: {
                userId,
                eventId: parseInt(eventId),
                status: { not: "CANCELLED" },
            },
        });

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: "You are already registered for this event",
            });
        }

        // Create registration
        const registration = await prisma.eventRegistration.create({
            data: {
                userId,
                eventId: parseInt(eventId),
                numberOfGuests: numberOfGuests ? parseInt(numberOfGuests) : 1,
                specialRequests,
                status: "CONFIRMED",
            },
            include: {
                event: true,
            },
        });

        // Create payment if there's a fee
        if (event.registrationFee > 0) {
            await prisma.payment.create({
                data: {
                    userId,
                    amount: event.registrationFee,
                    paymentMethod: "ONLINE",
                    status: "PENDING",
                    type: "EVENT",
                    eventRegistrationId: registration.id,
                },
            });
        }

        res.status(201).json({
            success: true,
            message: "Successfully registered for event",
            data: registration,
        });
    } catch (error) {
        console.error("Register for event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register for event",
            error: error.message,
        });
    }
};

// Cancel event registration
export const cancelEventRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const registration = await prisma.eventRegistration.findUnique({
            where: { id: parseInt(id) },
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        if (registration.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this registration",
            });
        }

        await prisma.eventRegistration.update({
            where: { id: parseInt(id) },
            data: {
                status: "CANCELLED",
            },
        });

        res.json({
            success: true,
            message: "Event registration cancelled successfully",
        });
    } catch (error) {
        console.error("Cancel registration error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel registration",
            error: error.message,
        });
    }
};

// Get user's event registrations
export const getUserEventRegistrations = async (req, res) => {
    try {
        const userId = req.user.id;

        const registrations = await prisma.eventRegistration.findMany({
            where: { userId },
            include: {
                event: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        console.error("Get registrations error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch registrations",
            error: error.message,
        });
    }
};
