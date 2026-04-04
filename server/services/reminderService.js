import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

const startReminderService = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const notificationWindowStart = new Date(now.getTime() + 15 * 60000); // 15 mins from now
        const notificationWindowEnd = new Date(now.getTime() + 16 * 60000);   // 16 mins from now

        try {
            const appointments = await prisma.consultation.findMany({
                where: {
                    appointmentDate: {
                        gte: notificationWindowStart,
                        lt: notificationWindowEnd,
                    },
                    status: 'ACTIVE', // Or PENDING_PAYMENT if they can be notified then
                    reminderSent: false,
                },
                include: {
                    user: true,
                    doctor: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            for (const appt of appointments) {
                // Email to Patient
                if (appt.user?.email) {
                    await sendEmail({
                        to: appt.user.email,
                        subject: 'Appointment Reminder - PetEase',
                        html: `
                            <h2>Appointment Reminder</h2>
                            <p>Dear ${appt.user.fullName},</p>
                            <p>This is a reminder that your appointment with <strong>Dr. ${appt.doctor.user.fullName}</strong> is starting in 15 minutes.</p>
                            <p>Please be ready to join.</p>
                        `
                    });
                }

                // Email to Doctor
                if (appt.doctor?.user?.email) {
                    await sendEmail({
                        to: appt.doctor.user.email,
                        subject: 'Appointment Reminder - PetEase',
                        html: `
                            <h2>Appointment Reminder</h2>
                            <p>Dear Dr. ${appt.doctor.user.fullName},</p>
                            <p>This is a reminder that your appointment with patient <strong>${appt.user.fullName}</strong> is starting in 15 minutes.</p>
                            <p>Please be ready to join.</p>
                        `
                    });
                }

                // Mark as sent
                await prisma.consultation.update({
                    where: { id: appt.id },
                    data: { reminderSent: true }
                });

                console.log(`Reminder sent for consultation ${appt.id}`);
            }
        } catch (error) {
            console.error('Error in reminder service:', error);
        }
    });

    console.log('Reminder service started');
};

export default startReminderService;
