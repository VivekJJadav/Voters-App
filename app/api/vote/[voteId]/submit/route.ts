import { NextResponse } from "next/server";
import client from "@/app/libs/prismadb";
import * as jose from "jose";
import { cookies } from "next/headers";

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
    const token = cookieStore.get("authToken")?.value;

    console.log("Token from cookie:", token);

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
        new TextEncoder().encode(process.env.JWT_SECRET)
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

    const [vote, existingResult] = await Promise.all([
      client.vote.findUnique({
        where: { id: voteId },
        include: {
          candidates: true,
        },
      }),
      client.voteResult.findFirst({
        where: {
          voteId,
          userId: user.id, // Check by user instead of candidateId
        },
      }),
    ]);

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    if (!vote.isActive) {
      return NextResponse.json(
        { error: "This vote is no longer active" },
        { status: 400 }
      );
    }

    if (vote.endTime && new Date(vote.endTime) < new Date()) {
      return NextResponse.json(
        { error: "This vote has ended" },
        { status: 400 }
      );
    }

    const isValidCandidate = vote.candidates.some(
      (candidate) => candidate.id === candidateId
    );

    if (!isValidCandidate) {
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

    // Replace the existing vote submission transaction with:
    const result = await client.$transaction(async (tx) => {
      // Check if user has already voted in this vote
      const existingUserVote = await tx.voteResult.findFirst({
        where: {
          voteId,
          userId: user.id,
        },
      });

      if (existingUserVote) {
        throw new Error("You have already voted in this vote");
      }

      // Create new vote result for the candidate
      const voteResult = await tx.voteResult.create({
        data: {
          voteId,
          candidateId,
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

      // Determine and mark the winner
      const voteResults = await tx.voteResult.findMany({
        where: { voteId },
      });

      const maxVotes = Math.max(...voteResults.map((r) => r.voteCount));

      await tx.voteResult.updateMany({
        where: {
          voteId,
          voteCount: maxVotes,
        },
        data: {
          isWinner: true,
        },
      });

      await tx.voteResult.updateMany({
        where: {
          voteId,
          voteCount: { not: maxVotes },
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

    // Then get the candidates data separately
    const candidatesWithResults = await Promise.all(
      vote.candidates.map(async (candidate) => {
        const voteResult = vote.results.find(
          (result) => result.candidateId === candidate.id
        );

        const slogan = vote.slogans.find((s) => s.userId === candidate.userId);

        return {
          id: candidate.id,
          name: candidate.user.name,
          slogan: slogan?.content || "No slogan provided",
          votes: voteResult?.voteCount || 0,
          isWinner: voteResult?.isWinner || false,
          statistics: voteResult?.statistics || null,
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
      endDate: vote.endTime,
      isActive: vote.isActive,
    });
  } catch (error) {
    console.error("Error fetching vote results:", error);
    return NextResponse.json(
      { error: "Failed to fetch vote results" },
      { status: 500 }
    );
  }
}
