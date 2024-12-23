import { NextResponse } from "next/server";
import client from "@/app/libs/prismadb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  console.log(id);

  if (!id) {
    return NextResponse.json(
      { error: "Creator ID is required" },
      { status: 400 }
    );
  }

  try {
    const organizations = await client.organization.findMany({
      where: { creatorId: id },
      //   orderBy: {
      //     createdAt: 'desc'  // Show newest first
      //   },
      select: {
        id: true,
        name: true,
        // createdAt: true,
        votes: true,
        departments: true,
      },
    });

    console.log(organizations);

    return NextResponse.json(organizations || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json([], {
      status: 500,
      statusText: "Failed to fetch organizations",
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  console.log(`Delete Request for Organization ID: ${id}`);

  if (!id) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  try {
    await client.organization.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Organization deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  console.log(`Update Request for Organization ID: ${id}`);

  if (!id) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json(); 

    const updatedOrganization = await client.organization.update({
      where: { id },
      data: {
        ...body, 
      },
      select: {
        id: true,
        name: true,
        votes: true,
        departments: true,
      },
    });

    return NextResponse.json(updatedOrganization, { status: 200 });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}
