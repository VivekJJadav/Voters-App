import { NextResponse } from "next/server";
import client from "@/app/libs/prismadb";
import * as jose from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

interface TokenPayload {
  id: string;
  email: string;
  organizationId?: string | null;
  departmentId?: string | null;
}

export async function POST(
  request: Request,
  { params }: { params: { voteId: string } }
) {
  try {
    const cookieStore = cookies();
    const authorizationHeader = request.headers.get("authorization");
    const bearerToken = authorizationHeader?.startsWith("Bearer ")
      ? authorizationHeader.slice("Bearer ".length)
      : null;
    const token = cookieStore.get("authToken")?.value || bearerToken;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let decodedToken: TokenPayload;
    try {
      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );

      if (typeof payload.id !== "string" || typeof payload.email !== "string") {
        throw new Error("Invalid token payload structure");
      }

      decodedToken = {
        id: payload.id,
        email: payload.email,
        organizationId: (payload.organizationId as string) || null,
        departmentId: (payload.departmentId as string) || null,
      };
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { candidateId } = await request.json();
    const { voteId } = params;

    if (!candidateId || !voteId) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const user = await client.user.findUnique({
      where: { id: decodedToken.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const vote = await client.vote.findUnique({
      where: { id: voteId },
      include: {
        candidates: true,
      },
    });

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    const membership = await client.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: vote.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    if (vote.departmentId) {
      const departmentMembership = await client.userDepartment.findFirst({
        where: {
          userId: user.id,
          departmentId: vote.departmentId,
        },
      });

      if (!departmentMembership) {
        return NextResponse.json(
          { error: "User is not a member of this department" },
          { status: 403 }
        );
      }
    }

    const now = new Date();
    const startTime = new Date(vote.startTime);
    const effectiveEndTime = vote.extendedTime || vote.endTime;

    if (startTime > now) {
      return NextResponse.json(
        { error: "This vote has not started yet" },
        { status: 400 }
      );
    }

    if (effectiveEndTime && new Date(effectiveEndTime) <= now) {
      return NextResponse.json(
        { error: "This vote has ended" },
        { status: 400 }
      );
    }

    const selectedCandidate = vote.candidates.find(
      (candidate) =>
        candidate.id === candidateId || candidate.userId === candidateId
    );

    if (!selectedCandidate) {
      return NextResponse.json({ error: "Invalid candidate" }, { status: 400 });
    }

    const userVoteResult = await client.voteResult.findFirst({
      where: {
        voteId,
        userId: user.id,
      },
    });

    if (userVoteResult) {
      return NextResponse.json(
        { error: "You have already voted in this vote" },
        { status: 400 }
      );
    }

    const normalizeCandidateId = (id: string) => {
      const candidate = vote.candidates.find(
        (candidate) => candidate.userId === id || candidate.id === id
      );

      return candidate?.userId || id;
    };

    const candidateIdsForUsers = (userIds: string[]) =>
      vote.candidates
        .filter((candidate) => userIds.includes(candidate.userId))
        .flatMap((candidate) => [candidate.userId, candidate.id]);

    const result = await client.$transaction(async (tx) => {
      const existingUserVote = await tx.voteResult.findFirst({
        where: {
          voteId,
          userId: user.id,
        },
      });

      if (existingUserVote) {
        throw new Error("You have already voted in this vote");
      }

      const voteResult = await tx.voteResult.create({
        data: {
          voteId,
          candidateId: selectedCandidate.userId,
          userId: user.id,
          voteCount: 1,
          statistics: {
            votedAt: new Date(),
            voterInfo: vote.isAnonymous ? null : user.id,
          },
        },
      });

      // Update user vote participation
      await tx.user.update({
        where: { id: user.id },
        data: {
          voteParticipationCount: { increment: 1 },
        },
      });

      const voteResults = await tx.voteResult.findMany({
        where: { voteId },
        select: {
          candidateId: true,
          voteCount: true,
        },
      });

      const totalsByCandidateUserId = voteResults.reduce<Map<string, number>>(
        (totals, voteResult) => {
          const normalizedCandidateId = normalizeCandidateId(
            voteResult.candidateId
          );
          totals.set(
            normalizedCandidateId,
            (totals.get(normalizedCandidateId) || 0) + voteResult.voteCount
          );
          return totals;
        },
        new Map()
      );

      const maxVotes = Math.max(...totalsByCandidateUserId.values());
      const winningCandidateUserIds = [...totalsByCandidateUserId.entries()]
        .filter(([, voteCount]) => voteCount === maxVotes)
        .map(([candidateUserId]) => candidateUserId);

      const winningCandidateIds = candidateIdsForUsers(winningCandidateUserIds);
      await tx.voteResult.updateMany({
        where: {
          voteId,
          candidateId: { in: winningCandidateIds },
        },
        data: {
          isWinner: true,
        },
      });

      await tx.voteResult.updateMany({
        where: {
          voteId,
          candidateId: { notIn: winningCandidateIds },
        },
        data: {
          isWinner: false,
        },
      });

      return voteResult;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Vote submission error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit vote",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { voteId: string } }
) {
  try {
    // First, let's get the vote results separately with error handling
    const vote = await client.vote.findUnique({
      where: {
        id: params.voteId,
      },
      include: {
        candidates: {
          include: {
            user: true,
          },
        },
        results: true, // Get results without including candidate relation
        slogans: true,
      },
    });

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    const now = new Date();
    const effectiveEndTime = vote.extendedTime || vote.endTime;
    const hasEnded = Boolean(effectiveEndTime && effectiveEndTime <= now);

    if (!hasEnded) {
      return NextResponse.json(
        { error: "Results will be announced after the vote has ended" },
        { status: 403 }
      );
    }

    // Then get the candidates data separately
    const candidatesWithResults = await Promise.all(
      vote.candidates.map(async (candidate) => {
        const candidateVotes = vote.results.filter(
          (result) =>
            result.candidateId === candidate.userId ||
            result.candidateId === candidate.id
        );

        const totalVotes = candidateVotes.reduce(
          (sum, result) => sum + result.voteCount,
          0
        );
        const slogan = vote.slogans.find(
          (slogan) => slogan.userId === candidate.userId
        );

        return {
          id: candidate.id,
          name: candidate.user.name,
          slogan: slogan?.content || "",
          votes: totalVotes,
          isWinner: candidateVotes.some((result) => result.isWinner),
        };
      })
    );

    // Calculate total votes
    const totalVotes = vote.results.reduce(
      (sum, result) => sum + (result.voteCount || 0),
      0
    );

    return NextResponse.json({
      id: vote.id,
      voteName: vote.name,
      totalVotes,
      candidates: candidatesWithResults,
      endDate: effectiveEndTime,
      isActive: false,
    });
  } catch (error) {
    console.error("Error fetching vote results:", error);
    return NextResponse.json(
      { error: "Failed to fetch vote results" },
      { status: 500 }
    );
  }
}
