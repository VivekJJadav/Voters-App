import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import client from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, organizationId } = body;

    console.log("Body:", body);

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

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
        return NextResponse.json(
          { message: "User already in organization" },
          { status: 409 }
        );
      }

      const member = await client.organizationMember.create({
        data: {
          userId: existingUser.id,
          organizationId,
          role: "MEMBER",
        },
      });

      console.log("Member:", member);

      return NextResponse.json(
        { message: "User added to organization" },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });

      if (organizationId) {
        await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId,
            role: "MEMBER",
          },
        });
      }
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
