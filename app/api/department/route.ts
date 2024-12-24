import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// POST: Create a new department
export async function POST(request: Request) {
  try {
    const { name, parentId, organizationId } = await request.json();

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Name and organizationId are required." },
        { status: 400 }
      );
    }

    const organizationExists = await client.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organizationExists) {
      return NextResponse.json(
        { error: "Organization not found." },
        { status: 404 }
      );
    }

    const newDepartment = await client.department.create({
      data: {
        name,
        organizationId,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
        voters: true,
        organization: true,
        votes: true,
      },
    });

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      {
        error: "Failed to create department.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId header is required." },
        { status: 400 }
      );
    }

    const departments = await client.department.findMany({
      where: { organizationId },
      include: {
        parent: true,
        children: true,
        voters: true,
        organization: true,
        votes: true,
      },
    });

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch departments.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
