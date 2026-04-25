import client from "@/app/libs/prismadb";
import { verifyCandidacyInvitationToken } from "@/app/libs/candidacyInvitations";
import { NextResponse } from "next/server";

const SLOGAN_MAX_LENGTH = 180;

const resolveInvitation = async (token: string) => {
  const { voteId, userId } = await verifyCandidacyInvitationToken(token);

  const vote = await client.vote.findUnique({
    where: { id: voteId },
    include: {
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
      candidates: {
        where: { userId },
        select: {
          id: true,
          userId: true,
        },
      },
      slogans: {
        where: { userId },
        select: {
          id: true,
          content: true,
        },
      },
    },
  });

  if (!vote) {
    throw new Error("Vote not found");
  }

  const membership = await client.organizationMember.findFirst({
    where: {
      userId,
      organizationId: vote.organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this organization");
  }

  if (vote.departmentId) {
    const departmentMembership = await client.userDepartment.findFirst({
      where: {
        userId,
        departmentId: vote.departmentId,
      },
    });

    if (!departmentMembership) {
      throw new Error("You are not a member of this department");
    }
  }

  return {
    userId,
    vote,
    user: membership.user,
    existingCandidate: vote.candidates[0] || null,
    existingSlogan: vote.slogans[0] || null,
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const invitation = await resolveInvitation(token);

    return NextResponse.json({
      voteId: invitation.vote.id,
      voteName: invitation.vote.name,
      organizationName: invitation.vote.organization.name,
      departmentName: invitation.vote.department?.name || null,
      userName: invitation.user.name,
      accepted: Boolean(invitation.existingCandidate),
      slogan: invitation.existingSlogan?.content || "",
      sloganMaxLength: SLOGAN_MAX_LENGTH,
    });
  } catch (error) {
    console.error("Candidate invitation lookup error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to read candidate invitation",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token, decision, slogan } = await request.json();

    if (!token || (decision !== "accept" && decision !== "decline")) {
      return NextResponse.json(
        { error: "Invitation token and decision are required" },
        { status: 400 }
      );
    }

    const invitation = await resolveInvitation(token);
    const voteId = invitation.vote.id;
    const userId = invitation.userId;

    if (decision === "decline") {
      await client.$transaction(async (tx) => {
        await tx.voteCandidate.deleteMany({
          where: {
            voteId,
            userId,
          },
        });
        await tx.slogan.deleteMany({
          where: {
            voteId,
            userId,
          },
        });

        const remainingCandidateCount = await tx.voteCandidate.count({
          where: { userId },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            isCandidate: remainingCandidateCount > 0,
          },
        });
      });

      return NextResponse.json({
        success: true,
        accepted: false,
        message: "Candidacy declined",
      });
    }

    const trimmedSlogan = typeof slogan === "string" ? slogan.trim() : "";

    if (!trimmedSlogan) {
      return NextResponse.json(
        { error: "Please enter a slogan" },
        { status: 400 }
      );
    }

    if (trimmedSlogan.length > SLOGAN_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Slogan must be ${SLOGAN_MAX_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    await client.$transaction(async (tx) => {
      const existingCandidate = await tx.voteCandidate.findUnique({
        where: {
          userId_voteId: {
            userId,
            voteId,
          },
        },
      });

      if (!existingCandidate) {
        await tx.voteCandidate.create({
          data: {
            userId,
            voteId,
          },
        });
      }

      const existingSlogan = await tx.slogan.findFirst({
        where: {
          voteId,
          userId,
        },
      });

      if (existingSlogan) {
        await tx.slogan.update({
          where: { id: existingSlogan.id },
          data: { content: trimmedSlogan },
        });
      } else {
        await tx.slogan.create({
          data: {
            voteId,
            userId,
            content: trimmedSlogan,
          },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          isCandidate: true,
          ...(!existingCandidate
            ? { candidateParticipationCount: { increment: 1 } }
            : {}),
        },
      });
    });

    return NextResponse.json({
      success: true,
      accepted: true,
      message: "Candidacy accepted",
    });
  } catch (error) {
    console.error("Candidate response error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save candidate response",
      },
      { status: 400 }
    );
  }
}
