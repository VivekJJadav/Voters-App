"use client"

import { ClerkLoading, SignIn } from "@clerk/clerk-react";
import { ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

const Page = () => {
  return (
    <div className="h-full lg:flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 pt-16">
        <h1 className="font-bold text-3xl text-[#2E2A47]">Welcome back!</h1>
        <p className="text-base text-[#7E8CA0]">
          Log in or Create account to get back to your dashboard!
        </p>
      </div>
      <div className="flex items-center justify-center mt-8">
        <ClerkLoaded>
          <SignIn />
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2 className="animate-spin text-muted-foreground" />
        </ClerkLoading>
      </div>
    </div>
  );
};

export default Page;
