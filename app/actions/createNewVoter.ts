// import prisma from "@/app/libs/prismadb";
// import { Voter } from "@prisma/client";

// export const createNewVoter = async (voterData: Voter) => {
//   try {
//     const voter = await prisma.voter.create({
//       data: voterData,
//     });
//     return voter;
//   } catch (err: any) {
//     throw new Error(`Failed to create voter: ${err.message}`);
//   }
// };