"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationItem } from "./ConversationItem";
import { EmptyChat } from "./EmptyChat";
import { Spinner } from "@/components/ui";
import type { ConversationListItem } from "@/types/chat";

interface ConversationListProps {
  currentUserId: string;
  basePath?: string;
}

export function ConversationList({ currentUserId, basePath = "/cuenta/mensajes" }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchConversations}
          className="mt-4 text-andino-600 hover:underline"
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
    <div className="divide-y divide-neutral-100">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          basePath={basePath}
        />
      ))}
    </div>
  );
}
