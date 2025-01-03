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

    const user = await client.voter.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      console.error("User not found");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashedPassword!
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // if (
    //   organizationId &&
    //   !user.organizations.some((org) => org.organizationId === organizationId)
    // ) {
    //   await client.voterOrganization.create({
    //     data: {
    //       voter: {
    //         connect: { id: user.id },
    //       },
    //       organization: {
    //         connect: { id: organizationId },
    //       },
    //     },
    //   });
    // }

    if (organizationId) {
      const existingRelation = await client.voterOrganization.findFirst({
        where: {
          voterId: user.id,
          organizationId: organizationId,
        },
      });

      if (!existingRelation) {
        await client.voterOrganization.create({
          data: {
            voter: {
              connect: { id: user.id },
            },
            organization: {
              connect: { id: organizationId },
            },
          },
        });
      }
    }

    // Always fetch fresh user data before responding
    const updatedUser = await client.voter.findUnique({
      where: { id: user.id },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to fetch updated user data" },
        { status: 500 }
      );
    }

    const token = await new jose.SignJWT({
      id: updatedUser.id,
      email: updatedUser.email,
      organizationId: organizationId || null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(TOKEN_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: updatedUser, // Using the fresh data
      },
      { status: 200 }
    );

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
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
