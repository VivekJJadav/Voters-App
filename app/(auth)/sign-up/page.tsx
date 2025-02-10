"use client";

import { Suspense } from "react";
import Image from "next/image";
import { SignUpCard } from "@/app/features/(auth)/components/sign-up-card";

const SignInPage = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2">
        <div className="w-full h-full flex items-center justify-center p-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <div>Loading...</div>
              </div>
            }
          >
            <SignUpCard />
          </Suspense>
        </div>
        <div className="w-full h-full bg-slate-800 hidden lg:flex items-center justify-center">
          <Image
            src="/voterlogo.svg"
            height={400}
            width={400}
            alt="Logo"
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;