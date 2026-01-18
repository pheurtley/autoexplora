"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Send, Volume2, VolumeX } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
}

export interface MessageInputRef {
  setMessage: (message: string) => void;
  focus: () => void;
}

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInput({ onSend, disabled, onTypingChange, soundEnabled = true, onSoundToggle }, ref) {
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      setMessage: (message: string) => {
        setContent(message);
        // Focus and place cursor at end
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(message.length, message.length);
          }
        }, 0);
      },
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120
        )}px`;
      }
    }, [content]);

    // Handle typing indicator
    const handleTyping = () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      onTypingChange?.(true);

      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange?.(false);
      }, 2000);
    };

    // Cleanup typing timeout
    useEffect(() => {
      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedContent = content.trim();
      if (!trimmedContent || sending || disabled) return;

      setSending(true);
      onTypingChange?.(false);

      try {
        await onSend(trimmedContent);
        setContent("");
      } catch (error) {
        // Error is handled by parent
      } finally {
        setSending(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      handleTyping();
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 p-4 border-t border-neutral-200 bg-white"
      >
        {/* Sound toggle button */}
        {onSoundToggle && (
          <button
            type="button"
            onClick={onSoundToggle}
            className={`p-2.5 rounded-xl transition-colors ${
              soundEnabled
                ? "text-andino-600 hover:bg-andino-50"
                : "text-neutral-400 hover:bg-neutral-100"
            }`}
            title={soundEnabled ? "Silenciar notificaciones" : "Activar sonido"}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-neutral-300 px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 disabled:bg-neutral-100 disabled:cursor-not-allowed transition-all"
        />

        <button
          type="submit"
          disabled={!content.trim() || sending || disabled}
          className="p-2.5 bg-andino-600 text-white rounded-xl hover:bg-andino-700 focus:outline-none focus:ring-2 focus:ring-andino-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    );
  }
);
