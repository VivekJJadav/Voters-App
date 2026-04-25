"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import {
  BarChart3,
  Bell,
  CheckCheck,
  Loader2,
  MailQuestion,
  Vote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type NotificationType = "candidacy" | "vote_started" | "result_ready";
type NotificationPriority = "high" | "normal";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  priority: NotificationPriority;
}

const READ_NOTIFICATIONS_STORAGE_KEY = "voters-read-notifications";

const readStoredNotificationIds = () => {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(
      READ_NOTIFICATIONS_STORAGE_KEY
    );
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
};

const writeStoredNotificationIds = (ids: string[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    READ_NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(ids)
  );
};

const getNotificationIcon = (type: NotificationType) => {
  if (type === "candidacy") return MailQuestion;
  if (type === "result_ready") return BarChart3;
  return Vote;
};

const formatNotificationTime = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const diffInMinutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60000)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const NotificationDropdown = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setReadIds(readStoredNotificationIds());
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get<{ notifications: NotificationItem[] }>(
        "/api/notifications",
        {
          headers: {
            userId: user.id,
          },
        }
      );
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadNotifications = useMemo(
    () =>
      notifications.filter((notification) => !readIds.includes(notification.id)),
    [notifications, readIds]
  );

  const markAsRead = (notificationIds: string[]) => {
    const updatedIds = Array.from(new Set([...readIds, ...notificationIds]));
    setReadIds(updatedIds);
    writeStoredNotificationIds(updatedIds);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead([notification.id]);
    setOpen(false);
    router.push(notification.href);
  };

  const handleMarkAllRead = () => {
    markAsRead(notifications.map((notification) => notification.id));
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-slate-700/60 hover:text-white"
          aria-label="Open notifications"
        >
          <Bell className="size-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
              {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(24rem,calc(100vw-2rem))] rounded-lg bg-white p-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Notifications
            </p>
            <p className="text-xs text-slate-500">
              {user?.id ? `${unreadNotifications.length} unread` : "Sign in"}
            </p>
          </div>
          {notifications.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="mr-1 size-3.5" />
              Read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[24rem]">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Loading notifications
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-900">
                  No notifications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  New votes, candidacy invites, and results will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const isUnread = !readIds.includes(notification.id);

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    onSelect={(event) => {
                      event.preventDefault();
                      handleNotificationClick(notification);
                    }}
                    className="cursor-pointer rounded-md p-3 focus:bg-slate-100"
                  >
                    <div className="flex w-full items-start gap-3">
                      <div
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md ${
                          notification.priority === "high"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">
                            {notification.title}
                          </p>
                          {isUnread && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] font-medium text-slate-400">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </ScrollArea>
        <div className="border-t px-4 py-3">
          <p className="text-xs text-slate-500">
            Notifications are shown across your organizations.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
