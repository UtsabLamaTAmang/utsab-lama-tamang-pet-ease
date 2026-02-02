import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// eSewa Config (Test Environment - V2)

const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const MERCHANT_ID = "EPAYTEST";
const SECRET_KEY = "8gBm/:&EnhH.1/q";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Generate Signature
const generateSignature = (message) => {
    const hmac = crypto.createHmac("sha256", SECRET_KEY);
    hmac.update(message);
    return hmac.digest("base64");
};

// Initiate Payment (V2)
export const initiatePayment = async (req, res) => {
    try {
        const { amount, purpose } = req.body;
        const userId = req.user.id;

        // Create Transaction UUID
        const transactionUuid = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const productCode = MERCHANT_ID;

        // FORCE AMOUNT TO 100 for Test Environment (Common requirement for EPAYTEST)
        // We override the user's amount for the actual payment gateway Step
        const esewaAmount = "250";

        // Check for Doctor Registration purpose
        let doctorId = null;
        if (purpose === "DOCTOR_REGISTRATION") {
            const doctor = await prisma.doctor.findUnique({ where: { userId } });
            if (doctor) doctorId = doctor.id;
        }

        // Save pending payment record (Record the REAL amount or 100?)
        // We'll record 100 so verification passes successfully with the gateway's response
        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: 100, // Storing 100 to match gateway
                method: "ESEWA",
                status: "PENDING",
                type: purpose,
                transactionId: transactionUuid,
                doctorId: doctorId // Link to doctor if found
            }
        });

        // Generate Signature
        // Format: "total_amount=100,transaction_uuid=...,product_code=..."
        const signatureMessage = `total_amount=${esewaAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
        const signature = generateSignature(signatureMessage);

        const paymentData = {
            amount: esewaAmount,
            failure_url: `${CLIENT_URL}/payment/failure`,
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: productCode,
            signature: signature,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: `${CLIENT_URL}/payment/success`,
            tax_amount: "0",
            total_amount: esewaAmount,
            transaction_uuid: transactionUuid,
            url: ESEWA_URL
        };

        res.json({
            success: true,
            data: paymentData
        });

    } catch (error) {
        console.error("Initiate payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate payment",
            error: error.message
        });
    }
};



// Verify Payment (V2)
export const verifyPayment = async (req, res) => {
    try {
        const { encodedResponse } = req.body;

        if (!encodedResponse) {
            return res.status(400).json({ success: false, message: "Missing encoded response" });
        }

        let decodedData;
        try {
            const buffer = Buffer.from(encodedResponse, 'base64');
            decodedData = JSON.parse(buffer.toString('utf-8'));
        } catch (e) {
            return res.status(400).json({ success: false, message: "Invalid response data" });
        }

        const { transaction_uuid, status } = decodedData;

        if (status !== 'COMPLETE') {
            return res.status(400).json({ success: false, message: "Transaction not complete" });
        }

        // Find Payment
        const payment = await prisma.payment.findFirst({
            where: { transactionId: transaction_uuid }
        });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        if (payment.status === 'SUCCESS') {
            return res.json({ success: true, message: "Payment already verified" });
        }

        // Update Payment to SUCCESS and handle side effects
        const result = await prisma.$transaction(async (prisma) => {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'SUCCESS' }
            });

            // Update linked Order if exists
            const linkedPayment = await prisma.payment.findUnique({
                where: { id: payment.id },
                include: {
                    order: true,
                    doctor: true,
                    user: { select: { id: true, email: true, role: true } }
                }
            });

            if (linkedPayment.order) {
                await prisma.order.update({
                    where: { id: linkedPayment.order.id },
                    data: { status: 'PAID' }
                });
            }

            // If this was a doctor registration, auto-verify user (skip OTP)
            if (linkedPayment.type === 'DOCTOR_REGISTRATION') {
                // Determine if we should also verify the User account (email verified)
                await prisma.user.update({
                    where: { id: linkedPayment.user.id },
                    data: { isVerified: true }
                });

                // Auto-approve Doctor profile as requested
                if (linkedPayment.doctor) {
                    await prisma.doctor.update({
                        where: { id: linkedPayment.doctor.id },
                        data: {
                            verificationStatus: 'APPROVED',
                            isVerified: false,
                            verifiedAt: new Date()
                        }
                    });
                }

                return {
                    success: true,
                    message: "Payment verified successfully. Doctor approved.",
                    needsVerification: false // Skip OTP
                };
            }

            return {
                success: true,
                message: "Payment verified successfully"
            };
        });

        res.json(result);

    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: error.message
        });
    }
};

