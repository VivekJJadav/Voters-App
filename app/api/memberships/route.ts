import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const userId = searchParams.get("userId");

  if (!email || !userId) {
    return NextResponse.json(
      { error: "Email and userId required" },
      { status: 400 }
    );
  }

  try {
    const organizations = await client.organization.findMany({
      where: {
        OR: [{ members: { some: { user: { email } } } }, { creatorId: userId }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(organizations || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json([], { status: 500 });
  }
}
