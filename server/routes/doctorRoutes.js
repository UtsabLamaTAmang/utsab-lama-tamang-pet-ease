import express from "express";
import {
    registerDoctor,
    getAllDoctors,
    getDoctorById,
    bookConsultation,
    getUserConsultations,
    updateConsultationStatus,
    createPrescription,
    rateConsultation,
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,
    deactivateDoctor,
    reactivateDoctor,
    getDoctorProfile,
    updateAvailability,
    getDoctorSlots,
    updateDoctorProfile
} from "../controllers/doctorController.js";


import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Admin routes (must be before :id routes to avoid conflict)
router.get("/admin/pending", protect, admin, getPendingDoctors);
router.put("/admin/approve/:id", protect, admin, approveDoctor);
router.put("/admin/reject/:id", protect, admin, rejectDoctor);
router.put("/admin/deactivate/:id", protect, admin, deactivateDoctor);
router.put("/admin/reactivate/:id", protect, admin, reactivateDoctor);



// Profile route
router.get("/profile", protect, getDoctorProfile);
router.put("/profile", protect, updateDoctorProfile);

// Doctor registration (public)
router.post("/register", upload.fields([
    { name: 'licenseDoc', maxCount: 1 },
    { name: 'degreeDoc', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), registerDoctor);

// Consultation routes (Must be before :id routes)
router.post("/consultations", protect, bookConsultation);
router.get("/consultations", protect, getUserConsultations);
router.patch("/consultations/:id/status", protect, updateConsultationStatus);
router.patch("/consultations/:id/rate", protect, rateConsultation);

// Doctor routes
router.put("/availability", protect, updateAvailability);
router.get("/:id/slots", getDoctorSlots);
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// Prescription routes
router.post("/prescriptions", protect, createPrescription);

export default router;
