import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as jose from 'jose';
import client from "@/app/libs/prismadb";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const TOKEN_EXPIRATION = "1h";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await client.voter.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashedPassword!
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await new jose.SignJWT({ 
      id: user.id, 
      email: user.email 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(TOKEN_EXPIRATION)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json(
      { message: "Login successful", user },
      { status: 200 }
    );

    const maxAge = TOKEN_EXPIRATION.endsWith("h")
      ? parseInt(TOKEN_EXPIRATION) * 3600
      : parseInt(TOKEN_EXPIRATION);

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}