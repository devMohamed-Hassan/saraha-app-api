import { EventEmitter } from "events";
import { emailTemplate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";

const emailEmitter = new EventEmitter();

emailEmitter.on("confirmEmail", async ({ email, userName, otp }) => {
  const subject = "Please confirm your email";

  const html = emailTemplate({
    code: otp,
    name: userName,
    subject: "Please confirm your email",
    message:
      "Welcome to Saraha! To complete your registration, use the secure verification code below:",
    expiryMinutes: 10,
  });

  await sendEmail({
    to: email,
    html,
    subject,
  });

  console.log(`Confirmation email sent to ${email}`);
});

emailEmitter.on("forgotPassword", async ({ email, userName, otp }) => {
  const subject = "Password Reset Request";

  const html = emailTemplate({
    code: otp,
    name: userName,
    subject: "Password Reset Request",
    message:
      "We received a request to reset your password. Use the OTP below to proceed:",
    expiryMinutes: 5,
  });

  await sendEmail({
    to: email,
    html,
    subject,
  });

  console.log(`Password reset email sent to ${email}`);
});

export default emailEmitter;
