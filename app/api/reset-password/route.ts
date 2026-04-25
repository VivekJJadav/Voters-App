import client from "@/app/libs/prismadb";
import {
  createPasswordResetSignature,
  verifyPasswordResetToken,
} from "@/app/libs/passwordReset";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const MIN_PASSWORD_LENGTH = 6;

const getStringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = getStringValue(body.token);
    const password = getStringValue(body.password);

    if (!token || !password) {
      return NextResponse.json(
        { error: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const payload = await verifyPasswordResetToken(token);
    const user = await client.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
      },
    });

    if (
      !user ||
      user.email !== payload.email ||
      !user.hashedPassword ||
      createPasswordResetSignature(user.hashedPassword) !==
        payload.passwordSignature
    ) {
      return NextResponse.json(
        { error: "Password reset link is invalid or has already been used" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    const isTokenError =
      error instanceof Error &&
      (error.message.includes("JWT") ||
        error.message.includes("JWS") ||
        error.message.includes("expired") ||
        error.message.includes("token"));

    if (!isTokenError) {
      console.error("Reset password error:", error);
    }

    return NextResponse.json(
      {
        error: isTokenError
          ? "Password reset link is invalid or has expired"
          : "Failed to reset password",
      },
      { status: 400 }
    );
  }
}
