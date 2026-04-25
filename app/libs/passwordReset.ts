import nodemailer from "nodemailer";
import * as jose from "jose";
import { createHash } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const PASSWORD_RESET_PURPOSE = "password-reset";
const PASSWORD_RESET_EXPIRATION = "1h";
const MAIL_USER = process.env.GMAIL_USER || "thevoters001@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface PasswordResetTokenPayload {
  userId: string;
  email: string;
  passwordSignature: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const createPasswordResetSignature = (passwordHash: string) =>
  createHash("sha256")
    .update(`${JWT_SECRET}:${passwordHash}`)
    .digest("hex");

export const createPasswordResetToken = async ({
  userId,
  email,
  passwordSignature,
}: PasswordResetTokenPayload) =>
  new jose.SignJWT({
    purpose: PASSWORD_RESET_PURPOSE,
    userId,
    email,
    passwordSignature,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(PASSWORD_RESET_EXPIRATION)
    .sign(new TextEncoder().encode(JWT_SECRET));

export const verifyPasswordResetToken = async (
  token: string
): Promise<PasswordResetTokenPayload> => {
  const { payload } = await jose.jwtVerify(
    token,
    new TextEncoder().encode(JWT_SECRET),
    { algorithms: ["HS256"] }
  );

  if (
    payload.purpose !== PASSWORD_RESET_PURPOSE ||
    typeof payload.userId !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.passwordSignature !== "string"
  ) {
    throw new Error("Invalid password reset token");
  }

  return {
    userId: payload.userId,
    email: payload.email,
    passwordSignature: payload.passwordSignature,
  };
};

export const sendPasswordResetEmail = async ({
  appUrl,
  email,
  name,
  passwordHash,
  userId,
}: {
  appUrl: string;
  email: string;
  name: string;
  passwordHash: string;
  userId: string;
}) => {
  if (!process.env.GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_APP_PASSWORD is not configured");
  }

  const token = await createPasswordResetToken({
    userId,
    email,
    passwordSignature: createPasswordResetSignature(passwordHash),
  });
  const resetLink = `${appUrl}/reset-password?${new URLSearchParams({
    token,
  }).toString()}`;

  await transporter.sendMail({
    from: `"The Voters" <${MAIL_USER}>`,
    to: email,
    subject: "Reset your The Voters password",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <p>Hi ${escapeHtml(name)},</p>
      <p>We received a request to reset your password for The Voters.</p>
      <p>This link will expire in 1 hour.</p>
      <div style="margin: 24px 0;">
        <a href="${resetLink}" style="background: #4f46e5; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset password</a>
      </div>
      <p>If you did not request this, you can ignore this email.</p>
    </div>`,
    text: `Hi ${name},

We received a request to reset your password for The Voters.

Reset your password: ${resetLink}

This link will expire in 1 hour. If you did not request this, you can ignore this email.`,
  });
};
