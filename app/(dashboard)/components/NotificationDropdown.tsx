"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

const NotifiactionDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Bell className="size-7 cursor-pointer rounded-md text-white/50 py-1 px-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4 bg-white shadow-lg rounded-lg">
        <div className="mb-2">
          <div className="font-semibold">Notification 1</div>
          <p>Details about notification 1.</p>
        </div>
        <div className="mb-2">
          <div className="font-semibold">Notification 2</div>
          <p>Details about notification 2.</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotifiactionDropdown;
