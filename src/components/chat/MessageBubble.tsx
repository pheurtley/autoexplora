"use client";

import { Check, CheckCheck } from "lucide-react";
import type { MessageBubbleProps } from "@/types/chat";

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-andino-600 text-white rounded-br-md"
            : "bg-white text-neutral-900 rounded-bl-md border border-neutral-200"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${
            isOwn ? "text-andino-200" : "text-neutral-400"
          }`}
        >
          <span className="text-xs">{time}</span>
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
