import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const main = async () => {
    const info = await transporter.sendMail({
      from: `Saraha App "$ {process.env.EMAIL_USER}"`,
      to,
      subject,
      html,
    });
  };
  main().catch((error) => {
    console.log(error);
  });
};
