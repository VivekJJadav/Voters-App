import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import client from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, organizationId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await client.voter.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const voterId = `VOTER-${Date.now()}`;

    const newUser = await client.voter.create({
      data: {
        name,
        email,
        hashedPassword,
        VoterId: voterId,
        organizations: {
          create: {
            organization: {
              connect: {
                id: organizationId,
              },
            },
          },
        },
      },
      include: {
        organizations: true,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
