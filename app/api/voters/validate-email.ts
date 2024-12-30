import client from "@/app/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  isValid: boolean;
  message?: string;
};

const doesEmailExist = async (email: string): Promise<boolean> => {
  const existingUser = await client.voter.findUnique({ where: { email } });
  return !!existingUser;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ isValid: false, message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ isValid: false, message: "Invalid email format" });
  }

  try {
    const exists = await doesEmailExist(email);
    if (exists) {
      return res
        .status(200)
        .json({ isValid: false, message: "Email already exists" });
    }

    return res.status(200).json({ isValid: true });
  } catch (err) {
    console.error("Error validating email:", err);
    return res
      .status(500)
      .json({ isValid: false, message: "Internal server error" });
  }
}
