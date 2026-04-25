import client from "@/app/libs/prismadb";
import { createCandidacyInvitationToken } from "@/app/libs/candidacyInvitations";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type NotificationType = "candidacy" | "vote_started" | "result_ready";
type NotificationPriority = "high" | "normal";

const MAX_NOTIFICATIONS = 20;
const RESULT_NOTIFICATION_WINDOW_MS = 1000 * 60 * 60 * 24 * 30;

const buildNotification = ({
  id,
  type,
  title,
  message,
  href,
  createdAt,
  priority = "normal",
}: {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  createdAt: Date;
  priority?: NotificationPriority;
}) => ({
  id,
  type,
  title,
  message,
  href,
  createdAt: createdAt.toISOString(),
  priority,
});

export async function GET(request: Request) {
  try {
    const organizationId = request.headers.get("organizationId");
    const userId = request.headers.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const memberships = await client.organizationMember.findMany({
      where: {
        userId,
        ...(organizationId ? { organizationId } : {}),
      },
      select: {
        organizationId: true,
      },
    });
    const organizationIds = memberships.map(
      (membership) => membership.organizationId
    );

    if (organizationIds.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    const departmentMemberships = await client.userDepartment.findMany({
      where: {
        userId,
        department: {
          organizationId: { in: organizationIds },
        },
      },
      select: {
        departmentId: true,
      },
    });
    const departmentIds = departmentMemberships.map(
      (membership) => membership.departmentId
    );

    const votes = await client.vote.findMany({
      where: {
        organizationId: { in: organizationIds },
        OR: [
          { departmentId: null },
          { departmentId: { isSet: false } },
          { departmentId: { in: departmentIds } },
        ],
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        candidates: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        slogans: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
    });

    const now = new Date();
    const origin = new URL(request.url).origin;
    const notifications = [];

    for (const vote of votes) {
      const scopeName = (vote.department?.name || vote.organization.name).trim();
      const hasAcceptedCandidacy =
        vote.candidates.length > 0 && vote.slogans.length > 0;
      const hasStarted = vote.startTime <= now;
      const effectiveEndTime = vote.extendedTime || vote.endTime;
      const hasEnded = Boolean(effectiveEndTime && effectiveEndTime <= now);
      const hasRecentlyEnded = Boolean(
        effectiveEndTime &&
          effectiveEndTime <= now &&
          now.getTime() - effectiveEndTime.getTime() <=
            RESULT_NOTIFICATION_WINDOW_MS
      );

      if (!hasAcceptedCandidacy && !hasEnded) {
        const token = await createCandidacyInvitationToken({
          voteId: vote.id,
          userId,
        });
        const href = `/candidate-response?${new URLSearchParams({
          token,
          choice: "yes",
        }).toString()}`;

        notifications.push(
          buildNotification({
            id: `candidacy-${vote.id}`,
            type: "candidacy",
            title: "Candidacy invitation",
            message: `${scopeName} invited you to stand for ${vote.name}. Add your slogan if you want to accept.`,
            href,
            createdAt: vote.createdAt,
            priority: "high",
          })
        );
      }

      if (hasStarted && !hasEnded) {
        notifications.push(
          buildNotification({
            id: `vote-started-${vote.id}-${vote.startTime.getTime()}`,
            type: "vote_started",
            title: "Vote has started",
            message: `${vote.name} is open for voting in ${scopeName}.`,
            href: `/vote/${vote.id}`,
            createdAt: vote.startTime,
            priority: "high",
          })
        );
      }

      if (hasRecentlyEnded && effectiveEndTime) {
        notifications.push(
          buildNotification({
            id: `result-ready-${vote.id}-${effectiveEndTime.getTime()}`,
            type: "result_ready",
            title: "Result is ready",
            message: `${vote.name} has ended. View the latest result.`,
            href: `/results/${vote.id}`,
            createdAt: effectiveEndTime,
          })
        );
      }
    }

    notifications.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === "high" ? -1 : 1;
      }

      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return NextResponse.json({
      notifications: notifications.slice(0, MAX_NOTIFICATIONS),
      appUrl: origin,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch notifications",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
