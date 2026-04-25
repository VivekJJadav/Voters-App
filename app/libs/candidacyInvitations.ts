import client from "@/app/libs/prismadb";
import nodemailer from "nodemailer";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const CANDIDACY_INVITATION_PURPOSE = "candidate-invitation";
const CANDIDACY_INVITATION_EXPIRATION = "14d";
const MAIL_USER = process.env.GMAIL_USER || "thevoters001@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface CandidateInvitationTokenPayload {
  voteId: string;
  userId: string;
}

export interface SendCandidacyInvitationResult {
  email: string;
  success: boolean;
  error?: string;
}

export interface SendCandidacyInvitationSummary {
  total: number;
  sent: number;
  failed: number;
  results: SendCandidacyInvitationResult[];
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const createCandidacyInvitationToken = async ({
  voteId,
  userId,
}: CandidateInvitationTokenPayload) =>
  new jose.SignJWT({
    purpose: CANDIDACY_INVITATION_PURPOSE,
    voteId,
    userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(CANDIDACY_INVITATION_EXPIRATION)
    .sign(new TextEncoder().encode(JWT_SECRET));

export const verifyCandidacyInvitationToken = async (
  token: string
): Promise<CandidateInvitationTokenPayload> => {
  const { payload } = await jose.jwtVerify(
    token,
    new TextEncoder().encode(JWT_SECRET),
    { algorithms: ["HS256"] }
  );

  if (
    payload.purpose !== CANDIDACY_INVITATION_PURPOSE ||
    typeof payload.voteId !== "string" ||
    typeof payload.userId !== "string"
  ) {
    throw new Error("Invalid invitation token");
  }

  return {
    voteId: payload.voteId,
    userId: payload.userId,
  };
};

export const sendCandidacyInvitationsForVote = async ({
  voteId,
  appUrl,
}: {
  voteId: string;
  appUrl: string;
}): Promise<SendCandidacyInvitationSummary> => {
  const vote = await client.vote.findUnique({
    where: { id: voteId },
    select: {
      id: true,
      name: true,
      description: true,
      departmentId: true,
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
    },
  });

  if (!vote) {
    throw new Error("Vote not found");
  }

  const members = await client.organizationMember.findMany({
    where: {
      organizationId: vote.organization.id,
      ...(vote.departmentId
        ? {
            user: {
              departments: {
                some: {
                  departmentId: vote.departmentId,
                },
              },
            },
          }
        : {}),
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

  const uniqueMembers = [
    ...new Map(members.map((member) => [member.user.email, member.user])).values(),
  ];

  if (!process.env.GMAIL_APP_PASSWORD) {
    const results = uniqueMembers.map((member) => ({
      email: member.email,
      success: false,
      error: "GMAIL_APP_PASSWORD is not configured",
    }));

    return {
      total: uniqueMembers.length,
      sent: 0,
      failed: results.length,
      results,
    };
  }

  const escapedVoteName = escapeHtml(vote.name);
  const escapedOrganizationName = escapeHtml(vote.organization.name);
  const escapedDepartmentName = vote.department
    ? escapeHtml(vote.department.name)
    : "";
  const scopeText = vote.department
    ? `${escapedOrganizationName} / ${escapedDepartmentName}`
    : escapedOrganizationName;
  const results: SendCandidacyInvitationResult[] = [];

  for (const member of uniqueMembers) {
    try {
      const token = await createCandidacyInvitationToken({
        voteId: vote.id,
        userId: member.id,
      });
      const yesLink = `${appUrl}/candidate-response?${new URLSearchParams({
        token,
        choice: "yes",
      }).toString()}`;
      const noLink = `${appUrl}/candidate-response?${new URLSearchParams({
        token,
        choice: "no",
      }).toString()}`;

      await transporter.sendMail({
        from: `"The Voters" <${MAIL_USER}>`,
        to: member.email,
        subject: `Candidate invitation for ${vote.name}`,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <p>Hi ${escapeHtml(member.name)},</p>
          <p>${scopeText} is preparing <strong>${escapedVoteName}</strong>.</p>
          <p>Would you like to stand as a candidate?</p>
          <div style="margin: 24px 0;">
            <a href="${yesLink}" style="background: #4f46e5; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 8px;">Yes, add my slogan</a>
            <a href="${noLink}" style="background: #f3f4f6; color: #111827; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">No</a>
          </div>
        </div>`,
        text: `Hi ${member.name},

${vote.organization.name} is preparing "${vote.name}".

Would you like to stand as a candidate?

Yes, add my slogan: ${yesLink}
No: ${noLink}`,
      });

      results.push({ email: member.email, success: true });
    } catch (error) {
      console.error(`Failed to send candidate invitation to ${member.email}:`, error);
      results.push({
        email: member.email,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send candidacy invitation",
      });
    }
  }

  const sent = results.filter((result) => result.success).length;

  return {
    total: uniqueMembers.length,
    sent,
    failed: uniqueMembers.length - sent,
    results,
  };
};
