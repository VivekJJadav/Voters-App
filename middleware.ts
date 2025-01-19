import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (!token) {
    return isApiRoute
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ["HS256"],
      }
    );

    const user = payload as { id: string; email: string };
    const response = NextResponse.next();

    response.headers.set("x-user-id", user.id);
    response.headers.set("x-user-email", user.email);

    return response;
  } catch (error) {
    console.error("Invalid token:", error);
    return isApiRoute
      ? NextResponse.json({ error: "Invalid token" }, { status: 401 })
      : NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/api/:path*", 
  ],
};
