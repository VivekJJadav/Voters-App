interface SendInvitationResult {
  email: string;
  success: boolean;
  error?: string;
}

import { NextResponse } from "next/server";
import { MailerSend, EmailParams } from "mailersend";
import client from "@/app/libs/prismadb";

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
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
      client.department.findUnique({
        where: { id: departmentId },
        select: { id: true, name: true },
      }),
    ]);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
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
        const link = `${
          process.env.NEXT_PUBLIC_APP_URL
        }/${redirectPath}?email=${encodeURIComponent(
          email
        )}&name=${encodeURIComponent(name)}&organizationId=${encodeURIComponent(
          organizationId
        )}&departmentId=${encodeURIComponent(departmentId)}`;

        const emailData = new EmailParams()
          .setFrom({
            email: process.env.MAILERSEND_FROM_EMAIL!,
            name: process.env.MAILERSEND_FROM_NAME || organization.name,
          })
          .setTo([{ email, name }])
          .setSubject(
            existingUser
              ? `Sign in to join ${organization.name}`
              : "Complete your registration"
          )
          .setHtml(
            `
            <div>
              <p>${
                existingUser
                  ? `Sign in to join ${organization.name} in the ${department.name} department`
                  : `Accept the invitation to join ${organization.name} in the ${department.name} department!`
              }</p>
              <a href="${link}" style="background: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
                ${existingUser ? "Sign In" : "Sign Up"}
              </a>
            </div>
          `
          )
          .setText(
            existingUser
              ? `Sign in to join ${organization.name} in the ${department.name} department: ${link}`
              : `Accept the invitation to join ${organization.name} in the ${department.name} department! ${link}`
          );
          
        await mailersend.email.send(emailData);

        if (existingUser) {
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
