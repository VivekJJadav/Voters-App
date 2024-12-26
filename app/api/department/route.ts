import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

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

export async function DELETE(request: Request) {
  try {
    const organizationId = request.headers.get("organizationid");
    const body = await request.json();
    const { id, childIds } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId header is required" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Department ID is required." },
        { status: 400 }
      );
    }

    await client.$transaction(async (prisma) => {
      if (childIds && childIds.length > 0) {
        const sortedChildIds = [...childIds].sort((a, b) => {
          return childIds.indexOf(b) - childIds.indexOf(a);
        });

        for (const childId of sortedChildIds) {
          await prisma.department.delete({
            where: {
              id: childId,
              organizationId,
            },
          });
        }
      }

      await prisma.department.delete({
        where: {
          id,
          organizationId,
        },
      });
    });

    return NextResponse.json(
      { message: "Department and all sub-departments deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      {
        error: "Failed to delete department.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
