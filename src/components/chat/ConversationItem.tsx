"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { formatPrice, getRelativeTime } from "@/lib/utils";
import type { ConversationItemProps } from "@/types/chat";

interface Props extends ConversationItemProps {
  basePath?: string;
}

export function ConversationItem({
  conversation,
  currentUserId,
  basePath = "/cuenta/mensajes",
}: Props) {
  const isBuyer = currentUserId === conversation.buyerId;
  const otherUser = isBuyer ? conversation.seller : conversation.buyer;
  const unreadCount = isBuyer
    ? conversation.buyerUnreadCount
    : conversation.sellerUnreadCount;

  const vehicleImage = conversation.vehicle.images[0]?.url;
  const lastMessagePreview = conversation.lastMessage
    ? conversation.lastMessage.content.length > 50
      ? `${conversation.lastMessage.content.substring(0, 50)}...`
      : conversation.lastMessage.content
    : "Sin mensajes";

  const isOwnMessage = conversation.lastMessage?.senderId === currentUserId;

  return (
    <Link
      href={`${basePath}/${conversation.id}`}
      className={`flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors ${
        unreadCount > 0 ? "bg-andino-50/50" : ""
      }`}
    >
      {/* Vehicle Image */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
        {vehicleImage ? (
          <Image
            src={vehicleImage}
            alt={conversation.vehicle.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <User className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 truncate">
              {otherUser.name || "Usuario"}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {conversation.vehicle.brand.name} {conversation.vehicle.model.name}
              {" - "}
              {formatPrice(conversation.vehicle.price)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-neutral-400">
              {getRelativeTime(conversation.lastMessageAt)}
            </span>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-andino-600 rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>
        <p
          className={`text-sm mt-1 truncate ${
            unreadCount > 0 ? "font-medium text-neutral-900" : "text-neutral-500"
          }`}
        >
          {isOwnMessage && <span className="text-neutral-400">Tú: </span>}
          {lastMessagePreview}
        </p>
      </div>
    </Link>
  );
}
