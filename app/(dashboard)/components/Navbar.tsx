"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { useMedia } from "react-use";
import { Button } from "@/components/ui/button";
import NavButton from "./NavButton";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import useAuthStore from "@/store/authStore";
import { User } from "@prisma/client";

const routes = [
  {
    label: "Home",
    href: "/home",
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMedia("(max-width: 1024px)", false);

  const user = useAuthStore((state) => state.user) as User;
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScrollTop();

  const onClick = async (href: string) => {
    try {
      router.push(href);
      setIsOpen(false);
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/sign-in");
  };

  return (
    <div
      className={cn(
        "z-50 bg-slate-600 h-24 w-full fixed transition-all duration-300",
        scrolled && "border-b border-neutral-200 shadow-sm"
      )}
    >
      <nav className="justify-between flex items-center h-full px-6 max-w-8xl mx-auto">
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="font-normal text-neutral-800 hover:bg-neutral-100"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#FDFBF7]">
              <SheetTitle className="text-neutral-800">Menu</SheetTitle>
              <nav className="flex flex-col gap-y-2 pt-6">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={route.href === pathname ? "secondary" : "ghost"}
                    onClick={() => onClick(route.href)}
                    className="w-full justify-start text-neutral-800 hover:bg-neutral-100"
                  >
                    {route.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="justify-start text-center">
            <ul className="flex space-x-4">
              {routes.map((item) => (
                <NavButton
                  key={item.href}
                  href={item.href}
                  label={item.label}
                />
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full  transition flex items-center justify-center">
            <NotificationDropdown />
          </div>
          {user && (
            <Button
              onClick={handleLogout}
              className="bg-neutral-900 text-white hover:bg-neutral-800 transition"
            >
              Log out
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
