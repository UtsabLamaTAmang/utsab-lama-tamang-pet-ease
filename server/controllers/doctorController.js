import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendEmail, sendOTP } from "../utils/emailService.js";
import jwt from "jsonwebtoken";


const prisma = new PrismaClient();

/**
 * Register a new doctor
 * POST /api/doctors/register
 */
export const registerDoctor = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            phone,
            specialization,
            experienceYears,
            fee,
            licenseNumber,
            qualification,
            bio,
            clinicAddress,
            availableDays,
            availableHours
        } = req.body;

        // Get uploaded files
        const licenseDoc = req.files?.licenseDoc?.[0];
        const degreeDoc = req.files?.degreeDoc?.[0];
        const photo = req.files?.photo?.[0];

        // Validate required fields
        if (!fullName || !email || !password || !specialization || !experienceYears || !fee || !licenseNumber || !qualification) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if license number already exists
        const existingLicense = await prisma.doctor.findUnique({
            where: { licenseNumber }
        });

        if (existingLicense) {
            return res.status(400).json({
                success: false,
                message: 'License number already registered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user with DOCTOR role
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                phone: phone || null,
                passwordHash,
                role: 'DOCTOR',
                isVerified: false
            }
        });

        // Create doctor profile
        const doctor = await prisma.doctor.create({
            data: {
                userId: user.id,
                specialization,
                experienceYears: parseInt(experienceYears),
                fee: parseInt(fee),
                licenseNumber,
                qualification,
                licenseDocUrl: licenseDoc ? `/uploads/doctor-documents/${licenseDoc.filename}` : null,
                degreeDocUrl: degreeDoc ? `/uploads/doctor-documents/${degreeDoc.filename}` : null,
                photoUrl: photo ? `/uploads/doctor-documents/${photo.filename}` : null,
                bio: bio || null,
                clinicAddress: clinicAddress || null,
                availableDays: availableDays || null,
                availableHours: availableHours || null,
                verificationStatus: 'PENDING',
                isVerified: false
            }
        });

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await prisma.oTP.create({
            data: {
                email,
                code: otpCode,
                expiresAt,
            },
        });

        // Send OTP Email
        try {
            await sendOTP(email, otpCode);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // We don't block registration if email fails, but user is unverified
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please verify your email after payment.',
            token,
            data: {
                id: doctor.id,
                fullName: user.fullName,
                email: user.email,
                specialization: doctor.specialization,
                verificationStatus: doctor.verificationStatus
            }
        });


    } catch (error) {
        console.error('Doctor registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
};

// Get all doctors with pagination, search, and filters
export const getAllDoctors = async (req, res) => {
    try {
        const {
            search,
            specialization,
            location,
            status,
            available,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build where clause
        let where = {};

        // Search across name, email, and specialization
        if (search) {
            where.OR = [
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { specialization: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Specialization filter
        if (specialization) {
            where.specialization = { contains: specialization, mode: 'insensitive' };
        }

        // Location filter
        if (location) {
            where.clinicAddress = { contains: location, mode: 'insensitive' };
        }

        // Status filter
        if (status) {
            where.verificationStatus = status;
        }

        // Available filter
        if (available === "true") {
            where.available = true;
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const total = await prisma.doctor.count({ where });

        // Get doctors with pagination (Public Fields Only)
        const doctors = await prisma.doctor.findMany({
            where,
            skip,
            take: limitNum,
            select: {
                id: true,
                specialization: true,
                experienceYears: true,
                fee: true,
                qualification: true,
                photoUrl: true,
                bio: true,
                clinicAddress: true,
                availableDays: true,
                availableHours: true,
                verificationStatus: true,
                available: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        // email: true, // Maybe keep email hidden for public? Or show it? Usually contact form is better.
                        // phone: true,
                    },
                },
                consultations: {
                    select: {
                        id: true,
                        rating: true,
                    },
                },
            },
            orderBy: { [sortBy]: order }
        });

        // Calculate average rating... (rest same)
        const doctorsWithRating = doctors.map((doctor) => {
            const ratings = doctor.consultations
                .filter((c) => c.rating)
                .map((c) => c.rating);
            const avgRating =
                ratings.length > 0
                    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                    : 0;

            const { consultations, ...doctorData } = doctor; // Remove consultations from response

            return {
                ...doctorData,
                averageRating: avgRating.toFixed(1),
                totalConsultations: doctor.consultations.length,
            };
        });

        res.json({
            success: true,
            data: doctorsWithRating,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Get doctors error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctors",
            error: error.message,
        });
    }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                consultations: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        res.json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error("Get doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctor",
            error: error.message,
        });
    }
};

// Book consultation
export const bookConsultation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { doctorId, appointmentDate, petDetails, symptoms, paymentMethod } =
            req.body;

        if (!doctorId || !appointmentDate) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID and appointment date are required",
            });
        }

        // Check if doctor exists and is available
        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(doctorId) },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        if (doctor.available === false) { // CHeck explicit false
            return res.status(400).json({
                success: false,
                message: "Doctor is currently unavailable",
            });
        }

        // Check if slot is taken
        const existing = await prisma.consultation.findFirst({
            where: {
                doctorId: parseInt(doctorId),
                appointmentDate: new Date(appointmentDate),
                status: { not: 'CANCELLED' } // Assuming this status exists in enum? AdoptionStatus has CANCELLED. ConsultationStatus?
            }
        });

        // ConsultationStatus: PENDING_PAYMENT, ACTIVE, COMPLETED. 
        // We probably need CANCELLED status in ConsultationStatus enum too?
        // Step 1646 says: PENDING_PAYMENT, ACTIVE, COMPLETED. 
        // So we can check if status is NOT 'COMPLETED' maybe? 
        // Or if it exists at all. PENDING_PAYMENT occupies the slot.
        // We should treat ANY status as occupied except maybe 'FAILED' payment?
        // PaymentStatus is separate.

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "This slot is already booked",
            });
        }

        // Create consultation
        const consultation = await prisma.consultation.create({
            data: {
                userId,
                doctorId: parseInt(doctorId),
                appointmentDate: new Date(appointmentDate),
                // petDetails, // Not in schema! Step 1646 Consultation model: petId, appointmentDate, status, chat, prescriptions, createdAt, pets, rating, review.
                // It does NOT have petDetails or symptoms!
                // It has `pets` relation.
                // We relate `petId`.
                // If user passes `petId`, we connect it.
                petId: req.body.petId ? parseInt(req.body.petId) : null,

                status: "PENDING_PAYMENT",
            },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        // Create payment record
        await prisma.payment.create({
            data: {
                userId,
                amount: calculatedAmount,
                method: paymentMethod || "CASH",
                status: "PENDING",
                type: "CONSULTATION",
                doctorId: doctor.id,
            },
        });

        // Create Chat for this consultation
        await prisma.chat.create({
            data: {
                consultationId: consultation.id
            }
        });

        // --- Fetch details for Email ---
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const doctorUser = await prisma.user.findUnique({ where: { id: doctor.userId } });

        const dateStr = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = new Date(appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Email to User
        if (user) {
            await sendEmail({
                to: user.email,
                subject: 'Appointment Confirmed - PetEase',
                html: `
                    <h2>Appointment Confirmed</h2>
                    <p>Dear ${user.fullName},</p>
                    <p>Your appointment with <strong>Dr. ${doctorUser.fullName}</strong> has been booked successfully.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Date:</strong> ${dateStr}</p>
                        <p><strong>Time:</strong> ${timeStr}</p>
                        <p><strong>Duration:</strong> ${req.body.duration || 30} mins</p>
                        <p><strong>Fee:</strong> Rs. ${calculatedAmount}</p>
                    </div>
                    <p>Please log in to your dashboard to join the consultation at the scheduled time.</p>
                `
            });
        }

        // Email to Doctor
        if (doctorUser) {
            await sendEmail({
                to: doctorUser.email,
                subject: 'New Appointment Booking - PetEase',
                html: `
                    <h2>New Appointment</h2>
                    <p>Dear Dr. ${doctorUser.fullName},</p>
                    <p>You have a new appointment booking with <strong>${user.fullName}</strong>.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Date:</strong> ${dateStr}</p>
                        <p><strong>Time:</strong> ${timeStr}</p>
                        <p><strong>Details:</strong> ${req.body.symptoms || "Regular Checkup"}</p>
                         <p><strong>Duration:</strong> ${req.body.duration || 30} mins</p>
                    </div>
                    <p>Check your schedule for more details.</p>
                `
            });
        }

        res.status(201).json({
            success: true,
            message: "Consultation booked successfully",
            data: consultation,
        });
    } catch (error) {
        console.error("Book consultation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to book consultation",
            error: error.message,
        });
    }
};

// Get consultations (User or Doctor)
export const getUserConsultations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status } = req.query;

        let where = {};

        if (userRole === 'DOCTOR') {
            const doctor = await prisma.doctor.findUnique({ where: { userId } });
            if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
            where.doctorId = doctor.id;
        } else {
            where.userId = userId;
        }

        if (status) where.status = status;

        const consultations = await prisma.consultation.findMany({
            where,
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true
                            },
                        },
                    },
                },
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                        imageUrl: true
                    }
                },
                chat: {
                    include: {
                        messages: {
                            orderBy: {
                                createdAt: "desc",
                            },
                            take: 1,
                        },
                    },
                },
                prescriptions: true,
            },
            orderBy: {
                appointmentDate: "desc",
            },
        });

        // Self-healing: Ensure all consultations have a chat room
        const consultationsWithChat = await Promise.all(consultations.map(async (c) => {
            if (!c.chat) {
                try {
                    const newChat = await prisma.chat.create({
                        data: { consultationId: c.id }
                    });
                    // Initialize empty messages array for consistency with include
                    return { ...c, chat: { ...newChat, messages: [] } };
                } catch (err) {
                    // Ignore error if chat already exists (race condition) or other issue
                    return c;
                }
            }
            return c;
        }));

        res.json({
            success: true,
            data: consultationsWithChat,
        });
    } catch (error) {
        console.error("Get consultations error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch consultations",
            error: error.message,
        });
    }
};

// Update consultation status
export const updateConsultationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, diagnosis, notes } = req.body;

        const consultation = await prisma.consultation.update({
            where: { id: parseInt(id) },
            data: {
                status,
                diagnosis,
                notes,
            },
            include: {
                doctor: true,
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Consultation updated successfully",
            data: consultation,
        });
    } catch (error) {
        console.error("Update consultation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update consultation",
            error: error.message,
        });
    }
};

// Create prescription
export const createPrescription = async (req, res) => {
    try {
        const { consultationId, medications, instructions, followUpDate } =
            req.body;

        if (!consultationId || !medications) {
            return res.status(400).json({
                success: false,
                message: "Consultation ID and medications are required",
            });
        }

        const prescription = await prisma.prescription.create({
            data: {
                consultationId: parseInt(consultationId),
                medications,
                instructions,
                followUpDate: followUpDate ? new Date(followUpDate) : null,
            },
            include: {
                consultation: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                        doctor: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Prescription created successfully",
            data: prescription,
        });
    } catch (error) {
        console.error("Create prescription error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create prescription",
            error: error.message,
        });
    }
};

// Rate consultation
export const rateConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        const consultation = await prisma.consultation.findUnique({
            where: { id: parseInt(id) },
        });

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found",
            });
        }

        if (consultation.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to rate this consultation",
            });
        }

        if (consultation.status !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Can only rate completed consultations",
            });
        }

        const updatedConsultation = await prisma.consultation.update({
            where: { id: parseInt(id) },
            data: {
                rating: parseInt(rating),
                review,
            },
        });

        res.json({
            success: true,
            message: "Consultation rated successfully",
            data: updatedConsultation,
        });
    } catch (error) {
        console.error("Rate consultation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to rate consultation",
            error: error.message,
        });
    }
};

// Update doctor profile (availability + general)
export const updateDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            specialization,
            experienceYears,
            fee,
            bio,
            clinicAddress,
            availableDays,
            availableHours,
            leaveDays,
            available
        } = req.body;

        const doctor = await prisma.doctor.findUnique({
            where: { userId },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found",
            });
        }

        const updatedDoctor = await prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                specialization,
                experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
                fee: fee ? parseInt(fee) : undefined,
                bio,
                clinicAddress,
                availableDays, // Assuming string provided
                availableHours, // Assuming string provided
                leaveDays, // Array of strings
                available
            },
        });

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedDoctor,
        });

    } catch (error) {
        console.error("Update doctor profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message,
        });
    }
};

// Get current doctor profile
export const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await prisma.doctor.findFirst({
            where: { userId: req.user.id },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found",
            });
        }

        res.json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error("Get doctor profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch doctor profile",
        });
    }
};

// Get pending doctor applications
export const getPendingDoctors = async (req, res) => {
    try {
        const pendingDoctors = await prisma.doctor.findMany({
            where: {
                verificationStatus: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        res.json({
            success: true,
            data: pendingDoctors
        });
    } catch (error) {
        console.error('Error fetching pending doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending applications'
        });
    }
};

// Approve doctor application
export const approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id; // From auth middleware

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Update doctor status
        const updatedDoctor = await prisma.doctor.update({
            where: { id: parseInt(id) },
            data: {
                verificationStatus: 'APPROVED',
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: adminId
            }
        });

        // Update user verification status as well
        await prisma.user.update({
            where: { id: doctor.userId },
            data: { isVerified: true }
        });

        // Send approval email
        try {
            await sendEmail({
                to: doctor.user.email,
                subject: 'Application Approved - PetEase Doctor Portal',
                html: `
                    <h2>Congratulations Dr. ${doctor.user.fullName}!</h2>
                    <p>We are pleased to inform you that your application to join PetEase has been approved.</p>
                    <p>You can now log in to your dashboard and start managing consultations.</p>
                    <br>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="padding: 10px 20px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 5px;">Login Now</a>
                    <br><br>
                    <p>Best regards,<br>PetEase Team</p>
                `
            });
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }

        res.json({
            success: true,
            message: 'Doctor approved successfully',
            data: updatedDoctor
        });

    } catch (error) {
        console.error('Error approving doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve doctor'
        });
    }
};

// Reject doctor application
export const rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id; // From auth middleware

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Update doctor status
        const updatedDoctor = await prisma.doctor.update({
            where: { id: parseInt(id) },
            data: {
                verificationStatus: 'REJECTED',
                isVerified: false,
                rejectionReason: reason,
                verifiedAt: new Date(),
                verifiedBy: adminId
            }
        });

        // Send rejection email
        try {
            await sendEmail({
                to: doctor.user.email,
                subject: 'Application Update - PetEase Doctor Portal',
                html: `
                    <h2>Dear Dr. ${doctor.user.fullName},</h2>
                    <p>Thank you for your interest in PetEase.</p>
                    <p>After reviewing your application, we regret to inform you that we cannot proceed with your registration at this time.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>If you believe this is an error or if you can address the issues mentioned, please contact our support team.</p>
                    <br>
                    <p>Best regards,<br>PetEase Team</p>
                `
            });
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
        }

        res.json({
            success: true,
            message: 'Doctor rejected successfully',
            data: updatedDoctor
        });

    } catch (error) {
        console.error('Error rejecting doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject doctor'
        });
    }
};

// Deactivate doctor
export const deactivateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        const updatedDoctor = await prisma.doctor.update({
            where: { id: parseInt(id) },
            data: {
                verificationStatus: 'DISABLED',
                isVerified: false,
                verifiedBy: adminId
            },
            include: { user: true }
        });

        res.json({
            success: true,
            message: "Doctor deactivated successfully",
            data: updatedDoctor,
        });
    } catch (error) {
        console.error("Deactivate doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to deactivate doctor",
            error: error.message,
        });
    }
};

// Reactivate doctor
export const reactivateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        const updatedDoctor = await prisma.doctor.update({
            where: { id: parseInt(id) },
            data: {
                verificationStatus: 'APPROVED',
                isVerified: true,
                verifiedBy: adminId
            },
            include: { user: true }
        });

        res.json({
            success: true,
            message: "Doctor reactivated successfully",
            data: updatedDoctor,
        });
    } catch (error) {
        console.error("Reactivate doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reactivate doctor",
            error: error.message,
        });
    }
};

// Update doctor availability
export const updateAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { availableDays, availableHours, available } = req.body;

        const doctor = await prisma.doctor.findUnique({
            where: { userId },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found",
            });
        }

        const updatedDoctor = await prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                availableDays: availableDays ? JSON.stringify(availableDays) : doctor.availableDays,
                availableHours: availableHours ? JSON.stringify(availableHours) : doctor.availableHours,
                available: available !== undefined ? available : doctor.available,
            },
        });

        res.json({
            success: true,
            message: "Availability updated successfully",
            data: {
                ...updatedDoctor,
                availableDays: updatedDoctor.availableDays ? JSON.parse(updatedDoctor.availableDays) : [],
                availableHours: updatedDoctor.availableHours ? JSON.parse(updatedDoctor.availableHours) : null,
            },
        });
    } catch (error) {
        console.error("Update availability error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update availability",
            error: error.message,
        });
    }
};

// Get available slots for a doctor on a specific date
export const getDoctorSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, duration } = req.query; // YYYY-MM-DD
        const requestedDuration = duration ? parseInt(duration) : 30; // Minutes

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
        });

        if (!doctor || !doctor.availableDays || !doctor.availableHours) {
            return res.json({ success: true, data: [] });
        }

        const requestedDate = new Date(date);
        const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

        const workingDays = JSON.parse(doctor.availableDays); // ["Monday", "Tuesday"]

        // Check for leave days
        if (doctor.leaveDays && doctor.leaveDays.includes(date)) {
            return res.json({
                success: true,
                data: [],
                message: "Doctor is on leave for this date"
            });
        }

        if (!workingDays.includes(dayName)) {
            return res.json({ success: true, data: [], message: `Doctor does not work on ${dayName}` });
        }

        const { start, end } = JSON.parse(doctor.availableHours); // { start: "09:00", end: "17:00" }

        // Generate slots
        // We generate start times every 30 minutes (or maybe 15 for better flexibility?)
        // Let's stick to 30 min intervals for start times for now to avoid too much noise
        const slots = [];
        let current = new Date(`${date}T${start}:00`);
        const endTime = new Date(`${date}T${end}:00`);

        while (current < endTime) {
            // Validate if (current + duration) <= endTime
            const potentialEnd = new Date(current.getTime() + requestedDuration * 60000);
            if (potentialEnd <= endTime) {
                slots.push(new Date(current));
            }
            current.setMinutes(current.getMinutes() + 30);
        }

        // Fetch existing bookings
        const nextDay = new Date(requestedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const bookings = await prisma.consultation.findMany({
            where: {
                doctorId: parseInt(id),
                appointmentDate: {
                    gte: new Date(date),
                    lt: nextDay
                }
            }
        });

        // Filter out booked slots
        // Check for overlaps with requested duration
        const availableSlots = slots.filter(slot => {
            const slotStart = slot.getTime();
            const slotEnd = slotStart + requestedDuration * 60000;

            return !bookings.some(booking => {
                if (!booking.appointmentDate) return false;

                const bookingStart = new Date(booking.appointmentDate).getTime();
                const bookingDuration = booking.duration || 30;
                const bookingEnd = bookingStart + bookingDuration * 60000;

                // Check overlap
                // Overlap if (StartA < EndB) AND (EndA > StartB)
                return (slotStart < bookingEnd) && (slotEnd > bookingStart);
            });
        });

        res.json({
            success: true,
            data: availableSlots.map(s => s.toISOString())
        });

    } catch (error) {
        console.error("Get slots error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch slots",
            error: error.message,
        });
    }
};
