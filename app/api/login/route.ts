import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import client from "@/app/libs/prismadb";
import { getUserWithMemberships } from "@/app/libs/userMemberships";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const TOKEN_EXPIRATION = "1h";
const objectIdPattern = /^[a-f\d]{24}$/i;

const getStringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = getStringValue(body.email).toLowerCase();
    const password = getStringValue(body.password);
    let organizationId = getStringValue(body.organizationId);
    let departmentId = getStringValue(body.departmentId);
    const organizationName = getStringValue(body.organizationName);
    const departmentName = getStringValue(body.departmentName);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = await client.user.findUnique({
      where: { email },
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

    if (organizationId && !objectIdPattern.test(organizationId)) {
      return NextResponse.json(
        { error: "Invalid organization invitation link" },
        { status: 400 }
      );
    }

    if (departmentId && !objectIdPattern.test(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department invitation link" },
        { status: 400 }
      );
    }

    if (departmentId && !organizationId) {
      return NextResponse.json(
        { error: "Department invitations require an organization" },
        { status: 400 }
      );
    }

    if (organizationId || departmentId) {
      if (organizationId) {
        let organization = await client.organization.findUnique({
          where: { id: organizationId },
          select: { id: true },
        });

        if (!organization && organizationName) {
          organization = await client.organization.findFirst({
            where: { name: organizationName },
            select: { id: true },
          });

          if (organization) {
            organizationId = organization.id;
          }
        }

        if (!organization) {
          return NextResponse.json(
            { error: "Organization invitation is no longer valid" },
            { status: 404 }
          );
        }

        const existingMembership = await client.organizationMember.findFirst({
          where: {
            userId: user.id,
            organizationId: organizationId,
          },
        });

        if (!existingMembership) {
          await client.organizationMember.create({
            data: {
              userId: user.id,
              organizationId: organizationId,
              role: "MEMBER",
            },
          });
        }
      }

      if (departmentId) {
        let department = await client.department.findFirst({
          where: {
            id: departmentId,
            organizationId,
          },
          select: { id: true },
        });

        if (!department && departmentName) {
          department = await client.department.findFirst({
            where: {
              name: departmentName,
              organizationId,
            },
            select: { id: true },
          });

          if (department) {
            departmentId = department.id;
          }
        }

        if (!department) {
          return NextResponse.json(
            { error: "Department invitation is no longer valid" },
            { status: 404 }
          );
        }

        const existingDepartmentMembership =
          await client.userDepartment.findFirst({
            where: {
              userId: user.id,
              departmentId: departmentId,
            },
          });

        if (!existingDepartmentMembership) {
          await client.userDepartment.create({
            data: {
              userId: user.id,
              departmentId: departmentId,
            },
          });
        }
      }
    }

    const updatedUser = await getUserWithMemberships(user.id);

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
        token: token
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
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", error, error instanceof Error ? error.stack : "");
    } else {
      console.error("Login error:", error);
    }
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
