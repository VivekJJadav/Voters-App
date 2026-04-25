"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Settings } from "lucide-react";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { useMedia } from "react-use";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const userInitials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "U";

  return (
    <div
      className={cn(
        "z-50 h-20 w-full fixed border-b border-white/10 bg-white/[0.07] backdrop-blur-2xl transition-all duration-300",
        scrolled && "shadow-[0_16px_40px_rgba(15,12,41,0.35)]"
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
                  className="font-normal text-white border-white/20 border bg-white/5 hover:bg-white/10 hover:text-white"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-white/10 bg-[#17142f]/95 text-white backdrop-blur-2xl">
                <SheetTitle className="text-white font-semibold">Menu</SheetTitle>
                <nav className="flex flex-col gap-y-2 pt-6">
                  {routes.map((route) => (
                    <Button
                      key={route.href}
                      variant={route.href === pathname ? "secondary" : "ghost"}
                      onClick={() => onClick(route.href)}
                      className={cn(
                        "w-full justify-start font-medium transition-colors",
                        route.href === pathname 
                          ? "bg-white/15 text-white hover:bg-white/20" 
                          : "text-white/70 hover:bg-white/10 hover:text-white"
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
                width={100}
                height={100}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/10 p-0.5 shadow-[0_8px_24px_rgba(15,12,41,0.2)] transition-all hover:border-white/25 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#8b9cf7]/70 focus:ring-offset-2 focus:ring-offset-[#211a52]"
                  aria-label="Open profile menu"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-sm font-semibold text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-56 border-white/12 bg-[#17142f]/95 p-2 text-white shadow-[0_20px_50px_rgba(15,12,41,0.42)] backdrop-blur-2xl"
              >
                <DropdownMenuLabel className="px-3 py-2">
                  <span className="block truncate text-sm font-semibold">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs font-normal text-white/55">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="cursor-pointer gap-2 rounded-md px-3 py-2 text-white/80 focus:bg-white/10 focus:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 rounded-md px-3 py-2 text-red-100 focus:bg-red-500/15 focus:text-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
