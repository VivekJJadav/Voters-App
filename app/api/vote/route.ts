import client from "@/app/libs/prismadb";
import { sendCandidacyInvitationsForVote } from "@/app/libs/candidacyInvitations";
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

    if (!name || !description || !organizationId) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const submittedCandidates = Array.isArray(candidates) ? candidates : [];

    const candidateUserIds = submittedCandidates
      .map((candidate: { userId?: string }) => candidate.userId)
      .filter(
        (userId: string | undefined): userId is string =>
          typeof userId === "string" && userId.length > 0
      );
    const uniqueCandidateUserIds = [...new Set(candidateUserIds)];

    if (candidateUserIds.length !== submittedCandidates.length) {
      return NextResponse.json(
        { error: "Every candidate must include a user ID" },
        { status: 400 }
      );
    }

    if (uniqueCandidateUserIds.length !== candidateUserIds.length) {
      return NextResponse.json(
        { error: "A candidate can only be added once to a vote" },
        { status: 400 }
      );
    }

    const [organization, department, candidateMembershipCount] =
      await Promise.all([
        client.organization.findUnique({
          where: { id: organizationId },
          select: { id: true },
        }),
        departmentId
          ? client.department.findFirst({
              where: { id: departmentId, organizationId },
              select: { id: true },
            })
          : null,
        uniqueCandidateUserIds.length > 0
          ? client.organizationMember.count({
              where: {
                organizationId,
                userId: { in: uniqueCandidateUserIds },
              },
            })
          : Promise.resolve(0),
      ]);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (departmentId && !department) {
      return NextResponse.json(
        { error: "Department does not belong to this organization" },
        { status: 400 }
      );
    }

    if (
      uniqueCandidateUserIds.length > 0 &&
      candidateMembershipCount !== uniqueCandidateUserIds.length
    ) {
      return NextResponse.json(
        { error: "All candidates must belong to the selected organization" },
        { status: 400 }
      );
    }

    const voteStartTime = startTime ? new Date(startTime) : new Date();
    const voteEndTime = endTime ? new Date(endTime) : null;

    const now = new Date();
    const isActive =
      voteStartTime <= now && (!voteEndTime || voteEndTime > now);

    const newVote = await client.vote.create({
      data: {
        name,
        description,
        startTime: voteStartTime,
        endTime: voteEndTime,
        isActive,
        isAnonymous: isAnonymous || false,
        voteType: voteType || "SINGLE_CHOICE",
        organizationId,
        departmentId,
        candidates: {
          create: uniqueCandidateUserIds.map((userId) => ({
            userId,
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

    let candidateInvitationSummary = null;

    try {
      candidateInvitationSummary = await sendCandidacyInvitationsForVote({
        voteId: newVote.id,
        appUrl: new URL(request.url).origin,
      });
    } catch (error) {
      console.error("Failed to send candidacy invitations:", error);
      candidateInvitationSummary = {
        total: 0,
        sent: 0,
        failed: 0,
        results: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to send candidacy invitations",
      };
    }

    return NextResponse.json(
      {
        ...newVote,
        candidateInvitationSummary,
      },
      { status: 201 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Detailed error:", error, error instanceof Error ? error.stack : "");
    } else {
      console.error("Detailed error:", error);
    }
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
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");
    const userId = request.headers.get("userId");

    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: "Organization ID and User ID are required" },
        { status: 400 }
      );
    }

    const membership = await client.organizationMember.findFirst({
      where: {
        userId,
        organizationId,
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
        organizationId,
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

    const now = new Date();
    const filteredVotes = votes.map((vote) => {
      const effectiveEndTime = vote.extendedTime || vote.endTime;
      const hasEnded = Boolean(effectiveEndTime && effectiveEndTime <= now);

      return {
        ...vote,
        results: hasEnded
          ? vote.results.filter(
              (result) => result.userId != null && result.candidateId != null
            )
          : [],
        isActive:
          vote.startTime <= now && (!effectiveEndTime || effectiveEndTime > now),
      };
    });

    return NextResponse.json(filteredVotes);
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

    const existingVote = await client.vote.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });

    if (!existingVote) {
      return NextResponse.json(
        { error: "Vote not found in this organization" },
        { status: 404 }
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

    if (!finalVote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    const now = new Date();
    const effectiveEndTime = finalVote.extendedTime || finalVote.endTime;
    const hasEnded = Boolean(effectiveEndTime && effectiveEndTime <= now);

    return NextResponse.json({
      ...finalVote,
      results: hasEnded ? finalVote.results : [],
      isActive:
        finalVote.startTime <= now &&
        (!effectiveEndTime || effectiveEndTime > now),
    });
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

    const existingVote = await client.vote.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });

    if (!existingVote) {
      return NextResponse.json(
        { error: "Vote not found in this organization" },
        { status: 404 }
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
