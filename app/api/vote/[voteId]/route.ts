import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { voteId: string } }
) {
  try {
    const userId = request.headers.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const membership = await client.organizationMember.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    const vote = await client.vote.findFirst({
      where: {
        id: params.voteId,
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
        results: {
          include: {
            user: true,
          }
        },
        slogans: true,
      },
    });

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }
    
    const now = new Date();
    const startTime = new Date(vote.startTime);
    const endTime = vote.endTime ? new Date(vote.endTime) : null;

    const isActive = startTime <= now && (!endTime || endTime > now);

    return NextResponse.json({
      ...vote,
      isActive,
      startTime: startTime.toISOString(),
      endTime: endTime?.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching vote:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch vote",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
