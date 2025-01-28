import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      name,
      description,
      candidates,
      startTime,
      endTime,
      isAnonymous,
      voteType,
      organizationId,
      departmentId,
    } = await request.json();

    if (!name || !description || !organizationId || !candidates) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const voteStartTime = startTime ? new Date(startTime) : new Date();
    const voteEndTime = endTime ? new Date(endTime) : null;

    const newVote = await client.vote.create({
      data: {
        name,
        description,
        startTime: voteStartTime,
        endTime: voteEndTime,
        isAnonymous: isAnonymous || false,
        voteType: voteType || "SINGLE_CHOICE",
        organizationId,
        departmentId,
        candidates: {
          create: candidates.map((candidate: { userId: string }) => ({
            userId: candidate.userId,
          })),
        },
      },
      include: {
        candidates: {
          include: {
            user: true,
          },
        },
        organization: true,
        department: true,
        results: true,
        slogans: true,
      },
    });

    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error("Detailed error:", error);

    if (error instanceof Error && error.message.includes("@@unique")) {
      return NextResponse.json(
        {
          error: "Failed to create vote",
          details: "A candidate can only be added once to a vote",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create vote",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");
    const userId = request.headers.get("userId"); 

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const membership = await client.organizationMember.findFirst({
      where: {
        userId: userId,
        organizationId: organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    const votes = await client.vote.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        candidates: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        results: true,
        slogans: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch votes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const {
      id,
      name,
      description,
      startTime,
      endTime,
      isAnonymous,
      voteType,
      candidates,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Vote ID is required" },
        { status: 400 }
      );
    }

    await client.vote.update({
      where: { id },
      data: {
        name,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        isAnonymous,
        voteType,
      },
      include: {
        candidates: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        results: true,
        slogans: true,
      },
    });

    if (candidates) {
      await client.voteCandidate.deleteMany({
        where: { voteId: id },
      });

      if (candidates.length > 0) {
        await client.voteCandidate.createMany({
          data: candidates.map((candidate: { userId: string }) => ({
            userId: candidate.userId,
            voteId: id,
          })),
        });
      }
    }

    const finalVote = await client.vote.findUnique({
      where: { id },
      include: {
        candidates: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        results: true,
        slogans: true,
      },
    });

    return NextResponse.json(finalVote);
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      {
        error: "Failed to update vote",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Vote ID is required" },
        { status: 400 }
      );
    }

    await client.$transaction([
      client.voteCandidate.deleteMany({
        where: { voteId: id },
      }),
      client.voteResult.deleteMany({
        where: { voteId: id },
      }),
      client.slogan.deleteMany({
        where: { voteId: id },
      }),
      client.vote.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: "Vote deleted successfully" });
  } catch (error) {
    console.error("Error deleting vote:", error);
    return NextResponse.json(
      {
        error: "Failed to delete vote",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
