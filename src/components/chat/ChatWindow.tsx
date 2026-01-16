"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { Spinner } from "@/components/ui";
import type { MessageWithSender, MessagesListResponse } from "@/types/chat";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  basePath?: string;
}

export function ChatWindow({ conversationId, currentUserId, basePath = "/cuenta/mensajes" }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [conversationData, setConversationData] = useState<
    MessagesListResponse["conversation"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async (markAsRead = true) => {
    try {
      const response = await fetch(
        `/api/mensajes/conversaciones/${conversationId}/mensajes`
      );
      if (!response.ok) {
        throw new Error("Error al cargar mensajes");
      }
      const data: MessagesListResponse = await response.json();
      setMessages(data.messages);
      setConversationData(data.conversation);
      setError(null);

      // Mark as read
      if (markAsRead) {
        fetch(`/api/mensajes/conversaciones/${conversationId}/leer`, {
          method: "POST",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();

    // Poll every 5 seconds when chat is active
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastFetchRef.current > 4000) {
        lastFetchRef.current = now;
        fetchMessages(true);
      }
    }, 5000);

    // Refetch on window focus
    const handleFocus = () => {
      lastFetchRef.current = Date.now();
      fetchMessages(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    setSending(true);
    try {
      const response = await fetch(
        `/api/mensajes/conversaciones/${conversationId}/mensajes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al enviar mensaje");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error || !conversationData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-600 mb-4">{error || "Conversación no encontrada"}</p>
        <button
          onClick={() => fetchMessages()}
          className="text-andino-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const isBuyer = currentUserId === conversationData.buyerId;
  const otherUser = isBuyer ? conversationData.seller : conversationData.buyer;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <ChatHeader
        otherUser={otherUser}
        vehicle={conversationData.vehicle}
        basePath={basePath}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            <p>No hay mensajes aún.</p>
            <p className="text-sm mt-1">
              Envía el primer mensaje para iniciar la conversación.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSendMessage} disabled={sending} />
    </div>
  );
}
