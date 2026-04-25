"use client";

import { ResetPasswordCard } from "@/app/features/(auth)/components/reset-password-card";
import { Suspense } from "react";

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="signin-loading-spinner" />
        </div>
      }
    >
      <ResetPasswordCard />
    </Suspense>
  );
};

export default ResetPasswordPage;
