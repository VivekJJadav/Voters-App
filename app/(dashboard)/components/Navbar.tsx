"use client";

import { usePathname, useRouter } from "next/navigation";

import { Bell, Menu } from "lucide-react";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useMedia } from "react-use";
import { Button } from "@/components/ui/button";
import Selector from "@/components/Selector";
import NavButton from "./NavButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import NotifiactionDropdown from "./NotificationDropdown";

const routes = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Organizations",
    href: "/organizations",
  },
  {
    label: "Vote",
    href: "/vote",
  },
  {
    label: "Results",
    href: "/results",
  },
  {
    label: "Settings",
    href: "/settings",
  },
];

const values = ["organization 1", "organization 2"];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMedia("(max-width: 1024px)", false);
  const { isSignedIn } = useUser();

  const pathname = usePathname();
  const router = useRouter();

  const scrolled = useScrollTop();

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "z-50 bg-gradient-to-b from-blue-700 to-blue-600 h-40 w-full fixed",
        scrolled && "border-b shadow-sm"
      )}
    >
      <nav className="justify-between flex pt-7 px-5">
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger>
              <Button
                variant="outline"
                size="sm"
                className="font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-y-2 pt-6">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={route.href === pathname ? "secondary" : "ghost"}
                    onClick={() => onClick(route.href)}
                    className="w-full justify-start"
                  >
                    {route.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="justify-start text-center">
            {/* <Image src="" alt="Logo" width={10} height={10}/> */}
            <ul className="flex space-x-2">
              {routes.map((item, index) => (
                <NavButton href={item.href} label={item.label} />
              ))}
            </ul>
          </div>
        )}
        <div className="flex absolute right-4 gap-2">
          <div className="w-8 h-8 bg-transparent border-[1px] rounded-sm border-blue-500 hover:border-black/40 flex items-center justify-center mt-[1px]">
            <NotifiactionDropdown />
          </div>
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button className="bg-blue-500 hover:bg-blue-600 mr-2">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </nav>
      <div className="lg:w-60 z-50 pt-8 px-7">
        <Selector values={values} placeholder="Select a organization" />
      </div>
    </div>
  );
};

export default Navbar;
