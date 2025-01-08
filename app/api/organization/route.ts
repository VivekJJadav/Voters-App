import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, creatorId } = await request.json();

    if (!name || !creatorId) {
      return NextResponse.json(
        { error: "Name and creatorId are required" },
        { status: 400 }
      );
    }

    const newOrganization = await client.organization.create({
      data: {
        name,
        creatorId,
        members: {
          create: {
            userId: creatorId,
            role: "ADMIN",
          },
        },
      },
      include: {
        creator: true,
        votes: true,
        departments: true,
        members: true,
      },
    });

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      {
        error: "Failed to create organization",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
