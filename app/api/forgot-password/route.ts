import client from "@/app/libs/prismadb";
import { sendPasswordResetEmail } from "@/app/libs/passwordReset";
import { NextResponse } from "next/server";

const getStringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = getStringValue(body.email).toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const user = await client.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        hashedPassword: true,
      },
    });

    if (user?.hashedPassword) {
      await sendPasswordResetEmail({
        appUrl: new URL(request.url).origin,
        email: user.email,
        name: user.name,
        passwordHash: user.hashedPassword,
        userId: user.id,
      });
    }

    return NextResponse.json({
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send password reset link",
      },
      { status: 500 }
    );
  }
}
