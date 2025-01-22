import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import client from "@/app/libs/prismadb";

interface SendInvitationResult {
  email: string;
  success: boolean;
  error?: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thevoters001@gmail.com", 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

export async function POST(request: Request) {
  try {
    const { emails, names, organizationId, departmentId } =
      await request.json();

    if (!emails?.length || !names?.length || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [organization, department] = await Promise.all([
      client.organization.findUnique({
        where: { id: organizationId },
      }),
      departmentId
        ? client.department.findUnique({
            where: { id: departmentId },
            select: { id: true, name: true },
          })
        : null,
    ]);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const results: SendInvitationResult[] = [];

    for (let i = 0; i < emails.length; i++) {
      try {
        const email = emails[i];
        const name = names[i];

        const existingUser = await client.user.findUnique({
          where: { email },
        });
        const redirectPath = existingUser ? "sign-in" : "sign-up";

        const urlParams = new URLSearchParams({
          email: email,
          name: name,
          organizationId: organizationId,
          ...(departmentId && { departmentId }),
        });

        const link = `${
          process.env.NEXT_PUBLIC_APP_URL
        }/${redirectPath}?${urlParams.toString()}`;

        await transporter.sendMail({
          from: "thevoters001@gmail.com", 
          to: email,
          subject: existingUser
            ? `Sign in to join ${organization.name}`
            : "Complete your registration",
          html: `<div>
          <p>${
            existingUser
              ? `Sign in to join ${organization.name}${
                  department ? ` in the ${department.name} department` : ""
                }`
              : `Accept the invitation to join ${organization.name}${
                  department ? ` in the ${department.name} department` : ""
                }!`
          }</p>
          <a href="${link}" style="background: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
            ${existingUser ? "Sign In" : "Sign Up"}
          </a>
        </div>`,
          text: existingUser
            ? `Sign in to join ${organization.name}${
                department ? ` in the ${department.name} department` : ""
              }: ${link}`
            : `Accept the invitation to join ${organization.name}${
                department ? ` in the ${department.name} department` : ""
              }! ${link}`,
        });

        if (existingUser && departmentId) {
          await client.userDepartment.create({
            data: {
              userId: existingUser.id,
              departmentId,
            },
          });
        }

        results.push({ email, success: true });
      } catch (error) {
        console.error(`Failed to send email to ${emails[i]}:`, error);
        results.push({
          email: emails[i],
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to send email",
        });
      }
    }

    const failedEmails = results.filter((r) => !r.success);

    if (failedEmails.length === results.length) {
      return NextResponse.json(
        { error: "All invitations failed to send", results },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results,
      partialSuccess: failedEmails.length > 0,
      failedCount: failedEmails.length,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to process invitation request" },
      { status: 500 }
    );
  }
}
