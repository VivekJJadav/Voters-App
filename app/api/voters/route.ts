import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const members = await client.organizationMember.findMany({
      where: {
        organizationId: organizationId,
        NOT: {
          role: "ADMIN",
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isCandidate: true,
            departments: true,
          },
        },
      },
    });

    const voters = members.map((member) => ({
      ...member.user,
      role: member.role,
      departments: [], 
    }));

    return NextResponse.json(voters);
  } catch (error) {
    console.error("Error fetching voters:", error);
    return NextResponse.json(
      { error: "Failed to fetch voters" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const organizationId = request.headers.get("organizationid");
    const body = await request.json();
    const { id } = body;

    if (!organizationId || !id) {
      return NextResponse.json(
        { error: "Organization ID and User ID are required" },
        { status: 400 }
      );
    }

    await client.$transaction(async (prisma) => {
      // Delete department memberships
      await prisma.userDepartment.deleteMany({
        where: {
          userId: id,
          department: {
            organizationId,
          },
        },
      });

      // Delete organization membership
      await prisma.organizationMember.deleteMany({
        where: {
          userId: id,
          organizationId: organizationId,
        },
      });
    });

    return NextResponse.json(
      { message: "Voter removed from organization successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing voter:", error);
    return NextResponse.json(
      { error: "Failed to remove voter." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");
    const body = await request.json();
    const { id, departmentIds, ...voterData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId header is required" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Voter ID is required." },
        { status: 400 }
      );
    }

    await client.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id },
        data: voterData,
      });

      if (departmentIds) {
        await prisma.userDepartment.deleteMany({
          where: {
            userId: id,
            department: {
              organizationId,
            },
          },
        });

        const departmentConnections = departmentIds.map(
          (departmentId: string) => ({
            departmentId,
            voterId: id,
          })
        );

        await prisma.userDepartment.createMany({
          data: departmentConnections,
        });
      }
    });

    const updatedVoter = await client.user.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
        organizations: true,
        candidates: true,
        slogans: true,
        voteResults: true,
      },
    });

    return NextResponse.json(updatedVoter, { status: 200 });
  } catch (error) {
    console.error("Error updating voter:", error);
    return NextResponse.json(
      {
        error: "Failed to update voter.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
