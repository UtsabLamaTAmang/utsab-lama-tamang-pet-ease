import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// eSewa Config (Test Environment - V2)
const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const MERCHANT_ID = "EPAYTEST";
const SECRET_KEY = "8gBm/:&EnhH.1/q";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const generateSignature = (message) => {
    const hmac = crypto.createHmac("sha256", SECRET_KEY);
    hmac.update(message);
    return hmac.digest("base64");
};

// Get all campaigns
export const getAllCampaigns = async (req, res) => {
    try {
        const { type, status } = req.query;

        const where = {};
        if (type) where.type = type;
        if (status) where.status = status;

        const campaigns = await prisma.campaign.findMany({
            where,
            orderBy: {
                date: "asc",
            },
        });

        res.json({
            success: true,
            data: campaigns,
        });
    } catch (error) {
        console.error("Get campaigns error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch campaigns",
            error: error.message,
        });
    }
};

// Get single campaign
export const getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(id) },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found",
            });
        }

        res.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        console.error("Get campaign error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch campaign",
            error: error.message,
        });
    }
};

// Get campaign with full donation details (public)
export const getCampaignDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const campaignId = parseInt(id);

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found",
            });
        }

        // Get all successful donations for this campaign
        const donations = await prisma.payment.findMany({
            where: {
                campaignId,
                status: "SUCCESS",
                type: "CAMPAIGN_DONATION",
            },
            include: {
                user: {
                    select: { id: true, fullName: true, imageUrl: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Aggregate top donors
        const donorMap = {};
        for (const don of donations) {
            const uid = don.user.id;
            if (!donorMap[uid]) {
                donorMap[uid] = {
                    userId: uid,
                    fullName: don.user.fullName,
                    imageUrl: don.user.imageUrl,
                    totalAmount: 0,
                    donationCount: 0,
                };
            }
            donorMap[uid].totalAmount += don.amount;
            donorMap[uid].donationCount += 1;
        }

        const topDonors = Object.values(donorMap)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 10);

        // Recent donations (last 10)
        const recentDonations = donations.slice(0, 10).map((d) => ({
            id: d.id,
            amount: d.amount,
            fullName: d.user.fullName,
            imageUrl: d.user.imageUrl,
            createdAt: d.createdAt,
        }));

        res.json({
            success: true,
            data: {
                ...campaign,
                donorCount: Object.keys(donorMap).length,
                topDonors,
                recentDonations,
            },
        });
    } catch (error) {
        console.error("Get campaign details error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch campaign details",
            error: error.message,
        });
    }
};

// Initiate donation payment for a campaign
export const donateToCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const userId = req.user?.id;
        const campaignId = parseInt(id);

        if (!amount || isNaN(amount) || amount < 10) {
            return res.status(400).json({
                success: false,
                message: "A minimum donation of Rs. 10 is required",
            });
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign || campaign.status !== "ACTIVE") {
            return res.status(404).json({
                success: false,
                message: "Campaign not found or inactive",
            });
        }

        const transactionUuid = `DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const productCode = MERCHANT_ID;
        // For eSewa test env, use 250 as fixed amount
        const esewaAmount = "250";

        // Save pending payment record linked to campaign
        await prisma.payment.create({
            data: {
                userId,
                amount: parseInt(amount),
                method: "ESEWA",
                status: "PENDING",
                type: "CAMPAIGN_DONATION",
                transactionId: transactionUuid,
                campaignId,
            },
        });

        const signatureMessage = `total_amount=${esewaAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
        const signature = generateSignature(signatureMessage);

        const paymentData = {
            amount: esewaAmount,
            failure_url: `${CLIENT_URL}/payment/failure`,
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: productCode,
            signature,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: `${CLIENT_URL}/payment/success`,
            tax_amount: "0",
            total_amount: esewaAmount,
            transaction_uuid: transactionUuid,
            url: ESEWA_URL,
            // Pass extra info for success page
            campaignId,
            displayAmount: parseInt(amount),
        };

        res.json({ success: true, data: paymentData });
    } catch (error) {
        console.error("Donate campaign error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate donation",
            error: error.message,
        });
    }
};

// Create campaign (admin only)
export const createCampaign = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            location,
            date,
            imageUrl,
            status,
            targetAmount,
        } = req.body;

        if (!title || !description || !type || !location || !date) {
            return res.status(400).json({
                success: false,
                message: "Title, description, type, location, and date are required",
            });
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                type,
                location,
                date: new Date(date),
                imageUrl,
                status: status || "ACTIVE",
                targetAmount: targetAmount ? parseInt(targetAmount) : 0,
            },
        });

        res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            data: campaign,
        });
    } catch (error) {
        console.error("Create campaign error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create campaign",
            error: error.message,
        });
    }
};

// Update campaign (admin only)
export const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, ...rest } = req.body;

        const updateData = { ...rest };
        if (date) {
            updateData.date = new Date(date);
        }

        const campaign = await prisma.campaign.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        res.json({
            success: true,
            message: "Campaign updated successfully",
            data: campaign,
        });
    } catch (error) {
        console.error("Update campaign error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update campaign",
            error: error.message,
        });
    }
};

// Delete campaign (admin only)
export const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.campaign.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            success: true,
            message: "Campaign deleted successfully",
        });
    } catch (error) {
        console.error("Delete campaign error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete campaign",
            error: error.message,
        });
    }
};
