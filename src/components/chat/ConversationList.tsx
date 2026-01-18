"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ConversationItem } from "./ConversationItem";
import { ConversationListSkeleton } from "./ConversationSkeleton";
import { EmptyChat } from "./EmptyChat";
import { Search, Filter, Inbox, CheckCircle2, MessageCircle, X } from "lucide-react";
import type { ConversationListItem } from "@/types/chat";

type FilterType = "all" | "unread" | "read";

interface ConversationListProps {
  currentUserId: string;
  basePath?: string;
}

export function ConversationList({ currentUserId, basePath = "/cuenta/mensajes" }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/mensajes");
      if (!response.ok) {
        throw new Error("Error al cargar conversaciones");
      }
      const data = await response.json();
      setConversations(data.conversations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    // Poll every 30 seconds
    const interval = setInterval(fetchConversations, 30000);

    // Refetch on window focus
    const handleFocus = () => fetchConversations();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchConversations]);

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Apply filter
    if (activeFilter === "unread") {
      result = result.filter((conv) => {
        const isBuyer = currentUserId === conv.buyerId;
        const unreadCount = isBuyer ? conv.buyerUnreadCount : conv.sellerUnreadCount;
        return unreadCount > 0;
      });
    } else if (activeFilter === "read") {
      result = result.filter((conv) => {
        const isBuyer = currentUserId === conv.buyerId;
        const unreadCount = isBuyer ? conv.buyerUnreadCount : conv.sellerUnreadCount;
        return unreadCount === 0;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((conv) => {
        const isBuyer = currentUserId === conv.buyerId;
        const otherUser = isBuyer ? conv.seller : conv.buyer;
        const userName = (otherUser.name || "").toLowerCase();
        const vehicleTitle = conv.vehicle.title.toLowerCase();
        const brandModel = `${conv.vehicle.brand.name} ${conv.vehicle.model.name}`.toLowerCase();
        const lastMessage = (conv.lastMessage?.content || "").toLowerCase();

        return (
          userName.includes(query) ||
          vehicleTitle.includes(query) ||
          brandModel.includes(query) ||
          lastMessage.includes(query)
        );
      });
    }

    return result;
  }, [conversations, activeFilter, searchQuery, currentUserId]);

  // Count unread conversations
  const unreadCount = useMemo(() => {
    return conversations.filter((conv) => {
      const isBuyer = currentUserId === conv.buyerId;
      const count = isBuyer ? conv.buyerUnreadCount : conv.sellerUnreadCount;
      return count > 0;
    }).length;
  }, [conversations, currentUserId]);

  const filterButtons = [
    { id: "all" as FilterType, label: "Todas", icon: Inbox, count: conversations.length },
    { id: "unread" as FilterType, label: "No leídas", icon: MessageCircle, count: unreadCount },
    { id: "read" as FilterType, label: "Leídas", icon: CheckCircle2, count: conversations.length - unreadCount },
  ];

  if (loading) {
    return (
      <div>
        {/* Search skeleton */}
        <div className="p-4 border-b border-neutral-200">
          <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
        </div>
        <ConversationListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-medium mb-2">Error al cargar mensajes</p>
        <p className="text-neutral-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="text-andino-600 hover:text-andino-700 font-medium hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return <EmptyChat />;
  }

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-neutral-200 space-y-3 bg-white sticky top-0 z-10">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle - Mobile */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-andino-600 transition-colors md:hidden"
        >
          <Filter className="w-4 h-4" />
          Filtrar
          {activeFilter !== "all" && (
            <span className="px-1.5 py-0.5 bg-andino-100 text-andino-700 text-xs rounded-full">
              1
            </span>
          )}
        </button>

        {/* Filter Buttons - Desktop always visible, Mobile toggle */}
        <div className={`flex gap-2 ${showFilters ? "flex" : "hidden md:flex"}`}>
          {filterButtons.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? "bg-andino-600 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <filter.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{filter.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === filter.id
                  ? "bg-white/20 text-white"
                  : "bg-neutral-200 text-neutral-500"
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Sin resultados
          </h3>
          <p className="text-neutral-500 mb-4">
            {searchQuery
              ? `No encontramos conversaciones que coincidan con "${searchQuery}"`
              : activeFilter === "unread"
              ? "No tienes conversaciones sin leer"
              : "No tienes conversaciones leídas"}
          </p>
          {(searchQuery || activeFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="text-andino-600 hover:text-andino-700 font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              currentUserId={currentUserId}
              basePath={basePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
