import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as jose from "jose";
import client from "@/app/libs/prismadb";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const TOKEN_EXPIRATION = "1h";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, organizationId, departmentId } = body;

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

    if (organizationId || departmentId) {
      await client.$transaction(async (tx) => {
        if (organizationId) {
          const existingMembership = await tx.organizationMember.findFirst({
            where: {
              userId: user.id,
              organizationId: organizationId,
            },
          });

          if (!existingMembership) {
            console.log("Creating new organization membership");
            await tx.organizationMember.create({
              data: {
                userId: user.id,
                organizationId: organizationId,
                role: "MEMBER",
              },
            });
          }
        }

        if (departmentId) {
          const existingDepartmentMembership =
            await tx.userDepartment.findFirst({
              where: {
                userId: user.id,
                departmentId: departmentId,
              },
            });

          if (!existingDepartmentMembership) {
            console.log("Creating new department membership");
            await tx.userDepartment.create({
              data: {
                userId: user.id,
                departmentId: departmentId,
              },
            });
          }
        }
      });
    }

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

    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      organizationId: organizationId || null,
      departmentId: departmentId || null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(TOKEN_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json(
      {
        message: organizationId
          ? "Login successful and organization membership updated"
          : "Login successful",
        user: updatedUser,
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
    console.error("Login error:", error);

    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        return NextResponse.json(
          { error: "User already exists in this department" },
          { status: 409 }
        );
      }
      if (error.message.includes("foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid department or organization ID" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
