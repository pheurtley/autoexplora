"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Check, CheckCheck } from "lucide-react";
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
    ? conversation.lastMessage.content.length > 60
      ? `${conversation.lastMessage.content.substring(0, 60)}...`
      : conversation.lastMessage.content
    : "Sin mensajes aún";

  const isOwnMessage = conversation.lastMessage?.senderId === currentUserId;
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={`${basePath}/${conversation.id}`}
      className={`group flex items-center gap-4 p-4 transition-all duration-200 relative ${
        hasUnread
          ? "bg-andino-50/60 hover:bg-andino-50"
          : "hover:bg-neutral-50"
      }`}
    >
      {/* Unread indicator bar */}
      {hasUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-andino-600 rounded-r-full" />
      )}

      {/* Vehicle Image */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 ring-2 ring-transparent group-hover:ring-andino-200 transition-all">
        {vehicleImage ? (
          <Image
            src={vehicleImage}
            alt={conversation.vehicle.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <User className="w-7 h-7" />
          </div>
        )}
        {/* User avatar overlay */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-white overflow-hidden shadow-sm">
          {otherUser.image ? (
            <Image
              src={otherUser.image}
              alt={otherUser.name || "Usuario"}
              width={28}
              height={28}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-andino-100 flex items-center justify-center">
              <User className="w-4 h-4 text-andino-600" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className={`font-semibold truncate ${
            hasUnread ? "text-neutral-900" : "text-neutral-700"
          }`}>
            {otherUser.name || "Usuario"}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs ${
              hasUnread ? "text-andino-600 font-medium" : "text-neutral-400"
            }`}>
              {getRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>
        </div>

        <p className="text-sm text-neutral-500 truncate mb-1">
          {conversation.vehicle.brand.name} {conversation.vehicle.model.name}
          <span className="mx-1.5 text-neutral-300">•</span>
          <span className="font-medium text-neutral-600">
            {formatPrice(conversation.vehicle.price)}
          </span>
        </p>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate flex items-center gap-1.5 ${
              hasUnread ? "font-medium text-neutral-900" : "text-neutral-500"
            }`}
          >
            {isOwnMessage && (
              <span className="shrink-0 text-neutral-400">
                {conversation.lastMessage && (
                  conversation.lastMessage.senderId === currentUserId ? (
                    <CheckCheck className="w-4 h-4 inline" />
                  ) : (
                    <Check className="w-4 h-4 inline" />
                  )
                )}
              </span>
            )}
            {isOwnMessage && <span className="text-neutral-400 shrink-0">Tú:</span>}
            <span className="truncate">{lastMessagePreview}</span>
          </p>

          {hasUnread && (
            <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold text-white bg-andino-600 rounded-full shrink-0 shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
