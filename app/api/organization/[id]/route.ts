import { NextResponse } from "next/server";
import client from "@/app/libs/prismadb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  console.log(id)

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
        departments: true
      }
    });

    console.log(organizations)

    return NextResponse.json(organizations || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json([], { 
      status: 500,
      statusText: "Failed to fetch organizations"
    });
  }
}