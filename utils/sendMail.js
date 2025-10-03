import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: options.email,
      subject: options.subject,
      html: options.message,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

// export const sendForgotPasswordMail = async (user, resetUrl) => {
//   const subject = "Password Reset Request";
//   const html = `
//     <p>Hi ${user.name || "User"},</p>
//     <p>You requested to reset your password.</p>
//     <p>Please click the link below to reset your password:</p>
//     <a href="${resetUrl}" target="_blank">${resetUrl}</a>
//     <p>If you did not request this, please ignore this email.</p>
//   `;
//   await sendEmail({ to: user.email, subject, html });
// };

// export const sendResetPasswordMail = async (user) => {
//   const subject = "Password Reset Successful";
//   const html = `
//     <p>Hi ${user.name || "User"},</p>
//     <p>Your password has been successfully reset.</p>
//     <p>If this was not you, please contact support immediately.</p>
//   `;
//   await sendEmail({ to: user.email, subject, html });
// };
