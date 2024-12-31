import { NextResponse } from "next/server";
import axios from "axios";
import client from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const { emails, names } = await request.json();

    const emailPromises = emails.map(async (email: string, index: number) => {
      const existingUser = await client.voter.findUnique({ where: { email } });
      const redirectPath = existingUser ? "sign-in" : "sign-up";
      const link = `${
        process.env.NEXT_PUBLIC_APP_URL
      }/${redirectPath}?email=${encodeURIComponent(
        email
      )}&name=${encodeURIComponent(names[index])}`;

      await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        {
          personalizations: [{ to: [{ email }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL },
          subject: existingUser
            ? "Sign in to join organization"
            : "Complete your registration",
          content: [
            {
              type: "text/html",
              value: `
            <div>
              <p>${
                existingUser
                  ? "Sign in to join the organization"
                  : "Accept the invitation!"
              }:</p>
              <a href="${link}" style="background: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
                ${existingUser ? "Sign In" : "Sign Up"}
              </a>
            </div>
          `,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    });

    await Promise.all(emailPromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
