"use client";

import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden signin-page-bg">
      {/* Animated floating orbs for visual depth */}
      <div className="signin-orb signin-orb-1" />
      <div className="signin-orb signin-orb-2" />
      <div className="signin-orb signin-orb-3" />

      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 relative z-10">
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
        <div className="w-full h-full hidden lg:flex items-center justify-center signin-panel-right">
          <div className="relative">
            <div className="signin-logo-glow" />
            <Image
              src="/voterlogo.svg"
              height={400}
              width={400}
              alt="Logo"
              className="object-contain relative z-10 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
