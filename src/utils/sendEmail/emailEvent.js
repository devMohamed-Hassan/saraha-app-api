import { EventEmitter } from "events";
import { emailTemplate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";

const emailEmitter = new EventEmitter();

export const emailEvents = {
  confirmEmail: {
    type: "confirmEmail",
    subject: "Please confirm your email",
    message:
      "Welcome to Saraha! To complete your registration, use the secure verification code below:",
    expiryMinutes: 10,
  },
  forgotPassword: {
    type: "forgotPassword",
    subject: "Password Reset Request",
    message:
      "We received a request to reset your password. Use the OTP below to proceed:",
    expiryMinutes: 5,
  },
  changeEmail: {
    type: "changeEmail",
    subject: "Confirm your new email address",
    message:
      "We received a request to change your email address on Saraha. To confirm this change, please use the verification code below:",
    expiryMinutes: 10,
  },
};

emailEmitter.on("sendEmail", async ({ type, email, userName, otp }) => {
  try {
    const config = emailEvents[type];
    if (!config) throw new Error(`Unknown email type: ${type}`);

    const html = emailTemplate({
      code: otp,
      name: userName,
      subject: config.subject,
      message: config.message,
      expiryMinutes: config.expiryMinutes,
    });

    await sendEmail({ to: email, html, subject: config.subject });

    console.log(`${config.subject} sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send ${type} email:`, err.message);
  }
});

export default emailEmitter;
