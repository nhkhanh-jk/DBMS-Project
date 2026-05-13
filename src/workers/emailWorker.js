// Email worker for sending booking confirmation emails
// This would typically connect to an email service like Nodemailer
// For now, we'll just log the email details

const { emailQueue } = require('./queue');

const processEmailJob = async (job) => {
  try {
    const { bookingId, userId } = job.data;
    console.log(`Processing email job for booking ${bookingId}, user ${userId}`);
    // In a real implementation, we would:
    // 1. Fetch booking and user details from database
    // 2. Generate email content
    // 3. Send email using Nodemailer or similar service
    // For demo purposes, we'll just log
    console.log(`Email sent for booking ${bookingId} to user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error processing email job:', error);
    throw error;
  }
};

// Process jobs from the email queue
emailQueue.process('booking-confirmation', processEmailJob);

module.exports = { emailQueue, processEmailJob };
