import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/app/libs/prismadb";
import { getUserWithMemberships } from "@/app/libs/userMemberships";

const objectIdPattern = /^[a-f\d]{24}$/i;

const getStringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const body = await req.json();

    const name = getStringValue(body.name || searchParams.get("name"));
    const email = getStringValue(
      body.email || searchParams.get("email")
    ).toLowerCase();
    const password = getStringValue(body.password || searchParams.get("password"));
    const organizationId = getStringValue(
      body.organizationId || searchParams.get("organizationId")
    );
    const departmentId = getStringValue(
      body.departmentId || searchParams.get("departmentId")
    );

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (organizationId && !objectIdPattern.test(organizationId)) {
      return NextResponse.json(
        { message: "Invalid organization invitation link" },
        { status: 400 }
      );
    }

    if (departmentId && !objectIdPattern.test(departmentId)) {
      return NextResponse.json(
        { message: "Invalid department invitation link" },
        { status: 400 }
      );
    }

    if (departmentId && !organizationId) {
      return NextResponse.json(
        { message: "Department invitations require an organization" },
        { status: 400 }
      );
    }

    if (organizationId) {
      const organization = await client.organization.findUnique({
        where: { id: organizationId },
        select: { id: true },
      });

      if (!organization) {
        return NextResponse.json(
          { message: "Organization invitation is no longer valid" },
          { status: 404 }
        );
      }
    }

    if (departmentId) {
      const department = await client.department.findFirst({
        where: {
          id: departmentId,
          organizationId,
        },
        select: { id: true },
      });

      if (!department) {
        return NextResponse.json(
          { message: "Department invitation is no longer valid" },
          { status: 404 }
        );
      }
    }

    let userId: string;

    const existingUser = await client.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!organizationId) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 409 }
        );
      }

      const existingMembership = await client.organizationMember.findFirst({
        where: {
          userId: existingUser.id,
          organizationId,
        },
      });

      if (existingMembership) {
        if (!departmentId) {
          return NextResponse.json(
            { message: "User already in organization" },
            { status: 409 }
          );
        }

        const existingDepartmentMembership =
          await client.userDepartment.findFirst({
            where: {
              userId: existingUser.id,
              departmentId,
            },
          });

        if (existingDepartmentMembership) {
          return NextResponse.json(
            { message: "User already in organization" },
            { status: 409 }
          );
        }

        await client.userDepartment.create({
          data: {
            userId: existingUser.id,
            departmentId,
          },
        });

        userId = existingUser.id;
      } else {
        await client.organizationMember.create({
          data: {
            userId: existingUser.id,
            organizationId,
            role: "MEMBER",
          },
        });

        if (departmentId) {
          await client.userDepartment.create({
            data: {
              userId: existingUser.id,
              departmentId,
            },
          });
        }

        userId = existingUser.id;
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await client.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });

      if (organizationId) {
        await client.organizationMember.create({
          data: {
            userId: newUser.id,
            organizationId,
            role: "MEMBER",
          },
        });
      }

      if (departmentId) {
        await client.userDepartment.create({
          data: {
            userId: newUser.id,
            departmentId,
          },
        });
      }

      userId = newUser.id;
    }

    const completeUser = await getUserWithMemberships(userId);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: completeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Registration error:", error, error instanceof Error ? error.stack : "");
    } else {
      console.error("Registration error:", error);
    }
    if (error instanceof Error) {
      if (error.message.includes("foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid department or organization ID" },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
