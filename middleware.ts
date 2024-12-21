import { NextRequest, NextResponse } from "next/server";
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  if (!token) {
    console.log('no token found');
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET),
        {
            algorithms: ['HS256'], 
        }
    );
    
    const user = payload as { id: string; email: string };

    // Create a new response with the modified headers
    const response = NextResponse.next();
    
    // Set the user info in the headers of the response, not the request
    response.headers.set("x-user-info", JSON.stringify(user));

    return response;
  } catch (error) {
    console.error("Invalid token:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: ["/"], 
};