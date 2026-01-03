const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const NotificationLog = require('../models/NotificationLog');

// Configure SendGrid if API Key exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmail = async (options) => {
  const { email, subject, message, type, userId, metadata } = options;
  let status = 'sent';
  let errorMsg = null;

  try {
    // STRATEGY 1: PRODUCTION (SendGrid)
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM || 'updates@academicverse.com', // Verified Sender
        subject: subject,
        html: message,
      };
      await sgMail.send(msg);
      console.log(`[SendGrid] Email sent to ${email}`);
    } 
    // STRATEGY 2: DEVELOPMENT (Nodemailer / Gmail)
    else {
      console.log('[Dev Mode] Using Nodemailer fallback...');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"AcademicVerse Dev" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: message
      });
      console.log(`[Nodemailer] Email sent to ${email}`);
    }

  } catch (error) {
    console.error('Email Engine Error:', error.response?.body || error.message);
    status = 'failed';
    errorMsg = error.message;
    // Don't throw error to prevent crashing main thread, just log failure
  }

  // --- SAFETY LAYER: AUDIT LOG ---
  if (userId) {
    try {
      await NotificationLog.create({
        user: userId,
        type: type || 'system',
        emailTo: email,
        subject: subject,
        status: status,
        error: errorMsg,
        metadata: metadata
      });
    } catch (logError) {
      console.error('Failed to save notification log:', logError.message);
    }
  }
};

module.exports = sendEmail;