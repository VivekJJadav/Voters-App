"use client";

import { Suspense } from "react";
import { SignUpCard } from "@/app/features/(auth)/components/sign-up-card";

const SignUpPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="signin-loading-spinner" />
        </div>
      }
    >
      <SignUpCard />
    </Suspense>
  );
};

export default SignUpPage;