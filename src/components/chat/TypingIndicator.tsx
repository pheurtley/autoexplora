"use client";

interface TypingIndicatorProps {
  userName?: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-neutral-600 rounded-2xl rounded-bl-md px-4 py-3 border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
          </div>
          {userName && (
            <span className="text-xs text-neutral-400 ml-1">
              {userName} está escribiendo...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
