"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput, MessageInputRef } from "./MessageInput";
import { MessageTemplates } from "./MessageTemplates";
import { TypingIndicator } from "./TypingIndicator";
import { Spinner } from "@/components/ui";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import type { MessageWithSender, MessagesListResponse } from "@/types/chat";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  basePath?: string;
  isDealer?: boolean;
}

export function ChatWindow({
  conversationId,
  currentUserId,
  basePath = "/cuenta/mensajes",
  isDealer = false,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [conversationData, setConversationData] = useState<
    MessagesListResponse["conversation"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<number>(0);
  const lastMessageCountRef = useRef<number>(0);
  const messageInputRef = useRef<MessageInputRef>(null);

  const { playMessageSound, playSentSound, setEnabled, isEnabled } = useNotificationSound();

  // Initialize sound preference
  useEffect(() => {
    setSoundEnabled(isEnabled());
  }, [isEnabled]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
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

      // Check for new messages and play sound
      if (data.messages.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
        const newMessages = data.messages.slice(lastMessageCountRef.current);
        const hasNewFromOther = newMessages.some(m => m.senderId !== currentUserId);
        if (hasNewFromOther) {
          playMessageSound();
        }
      }
      lastMessageCountRef.current = data.messages.length;

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
  }, [conversationId, currentUserId, playMessageSound]);

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
      lastMessageCountRef.current += 1;
      lastFetchRef.current = Date.now();
      playSentSound();
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (message: string) => {
    messageInputRef.current?.setMessage(message);
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    setEnabled(newValue);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Skeleton header */}
        <div className="flex items-center gap-3 p-4 border-b border-neutral-200 bg-white animate-pulse">
          <div className="w-10 h-10 rounded-full bg-neutral-200" />
          <div className="flex-1">
            <div className="h-5 bg-neutral-200 rounded w-32 mb-2" />
            <div className="h-4 bg-neutral-100 rounded w-24" />
          </div>
          <div className="w-12 h-12 rounded-lg bg-neutral-100" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !conversationData) {
    return (
      <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">
            {error || "Conversación no encontrada"}
          </p>
          <button
            onClick={() => fetchMessages()}
            className="text-andino-600 hover:text-andino-700 font-medium hover:underline"
          >
            Reintentar
          </button>
        </div>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-andino-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-andino-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-neutral-600 font-medium mb-1">
              Inicia la conversación
            </p>
            <p className="text-sm text-neutral-500">
              Envía un mensaje para comenzar a chatear sobre este vehículo
            </p>
          </div>
        ) : (
          <>
            {/* Date separator for first message */}
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-500">
                {new Date(messages[0].createdAt).toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {messages.map((message, index) => {
              // Check if we need a date separator
              const prevMessage = messages[index - 1];
              const showDateSeparator = prevMessage &&
                new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-500">
                        {new Date(message.createdAt).toLocaleDateString("es-CL", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === currentUserId}
                  />
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Templates - Only for dealers */}
      {isDealer && (
        <MessageTemplates
          onSelectTemplate={handleTemplateSelect}
          vehicleTitle={conversationData.vehicle.title}
          disabled={sending}
        />
      )}

      <MessageInput
        ref={messageInputRef}
        onSend={handleSendMessage}
        disabled={sending}
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
      />
    </div>
  );
}
