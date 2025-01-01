"use client";

import { SignUpCard } from "@/app/features/(auth)/components/sign-up-card";
import { Suspense } from "react";

const SignUpPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <SignUpCard />
    </Suspense>
  );
};

export default SignUpPage;
