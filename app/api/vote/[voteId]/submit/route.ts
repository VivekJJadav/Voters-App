import { NextResponse } from "next/server";
import client from "@/app/libs/prismadb";
import jwt from "jsonwebtoken";
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
          candidateId,
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

    if (existingResult) {
      return NextResponse.json(
        { error: "You have already voted" },
        { status: 400 }
      );
    }

    const result = await client.$transaction(async (tx) => {
      const voteResult = await tx.voteResult.create({
        data: {
          voteId,
          candidateId,
          voteCount: 1,
          statistics: {
            votedAt: new Date(),
            voterInfo: vote.isAnonymous ? null : user.id,
          },
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          voteParticipationCount: {
            increment: 1,
          },
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
