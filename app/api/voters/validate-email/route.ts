import client from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ isValid: false, message: "Invalid email format" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const existingUser = await client.voter.findUnique({ where: { email } });

    if (existingUser) {
      return new Response(
        JSON.stringify({ isValid: false, message: "Email already exists" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify({ isValid: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error validating email:", error);
    return new Response(
      JSON.stringify({ isValid: false, message: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
