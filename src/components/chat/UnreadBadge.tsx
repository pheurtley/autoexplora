"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface UnreadBadgeProps {
  className?: string;
}

export function UnreadBadge({ className }: UnreadBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/mensajes/no-leidos");
        if (response.ok && isMounted) {
          const data = await response.json();
          setUnreadCount(data.total);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Refetch on window focus
    const handleFocus = () => fetchUnreadCount();
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <Link
      href="/cuenta/mensajes"
      className={`relative p-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors ${className || ""}`}
    >
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
