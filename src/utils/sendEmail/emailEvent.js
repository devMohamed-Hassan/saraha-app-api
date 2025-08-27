import { EventEmitter } from "events";
import { emailTemplate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";

const emailEmitter = new EventEmitter();

emailEmitter.on("confirmEmail", async ({ email, userName, otp }) => {
  const subject = "Please confirm your email";
  const html = emailTemplate(otp, userName, subject);
  await sendEmail({
    to: email,
    html,
    subject,
  });
  console.log(`Confirmation email sent to ${email}`);
});

export default emailEmitter;
