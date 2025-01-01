"use client";

import { SignInCard } from "@/app/features/(auth)/components/sign-in-card";
import { Suspense } from "react";

const SignInPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <SignInCard />
    </Suspense>
  );
};

export default SignInPage;
