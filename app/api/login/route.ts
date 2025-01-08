// api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as jose from "jose";
import client from "@/app/libs/prismadb";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const TOKEN_EXPIRATION = "1h";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, organizationId } = body;

    console.log("Login request:", { email, organizationId });

    const user = await client.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Only handle organization membership if organizationId is provided
    if (organizationId) {
      const existingMembership = await client.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId: organizationId,
        },
      });

      if (!existingMembership) {
        console.log("Creating new organization membership");
        await client.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: organizationId,
            role: "MEMBER",
          },
        });
      }
    }

    // Fetch updated user data
    const updatedUser = await client.user.findUnique({
      where: { id: user.id },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                departments: true,
              },
            },
          },
        },
        departments: {
          include: {
            department: true,
          },
        },
      },
    });

    // Create JWT token
    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      organizationId: organizationId || null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(TOKEN_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: updatedUser,
      },
      { status: 200 }
    );

    // Set cookie
    const maxAge = TOKEN_EXPIRATION.endsWith("h")
      ? parseInt(TOKEN_EXPIRATION) * 3600
      : parseInt(TOKEN_EXPIRATION);

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
