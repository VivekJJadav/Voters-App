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
import Image from "next/image";

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
        "z-50 bg-gradient-to-r from-slate-800 to-slate-900 h-20 w-full fixed transition-all duration-300",
        scrolled && "border-b border-slate-700/50 shadow-xl"
      )}
    >
      <nav className="justify-between flex items-center h-full px-4 md:px-6 max-w-8xl mx-auto">
        {isMobile ? (
          <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-normal text-white border-white/80 border hover:bg-white/10 hover:text-white"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-slate-50">
                <SheetTitle className="text-slate-800 font-semibold">Menu</SheetTitle>
                <nav className="flex flex-col gap-y-2 pt-6">
                  {routes.map((route) => (
                    <Button
                      key={route.href}
                      variant={route.href === pathname ? "secondary" : "ghost"}
                      onClick={() => onClick(route.href)}
                      className={cn(
                        "w-full justify-start font-medium transition-colors",
                        route.href === pathname 
                          ? "bg-slate-200 text-slate-800 hover:bg-slate-300" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {route.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Image
                src="/voterlogo.svg"
                alt="Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-8">
            <Image
              src="/voterlogo.svg"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain cursor-pointer"
              priority
              onClick={() => router.push('/home')}
            />
            <ul className="flex items-center space-x-6">
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
        
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-full transition-colors flex items-center justify-center hover:bg-slate-700/60">
            <NotificationDropdown />
          </div>
          {user && (
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white font-medium px-6
                hover:from-red-700 hover:to-red-800 transition-all duration-300 
                shadow-lg hover:shadow-red-900/30 hover:scale-[1.02]"
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