import bcrypt from 'bcrypt';
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = getAuth(req); // Get the auth object

  const userId = auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Missing info' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.voter.create({
    data: {
      email,
      name,
      hashedPassword,
    },
  });

  return res.status(201).json(user);
}
