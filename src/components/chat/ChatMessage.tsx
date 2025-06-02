
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.sender === "assistant";

  return (
    <div
      className={cn(
        "flex space-x-3",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
          isAssistant
            ? "bg-gray-100 text-gray-900"
            : "bg-blue-600 text-white"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-xs mt-1",
            isAssistant ? "text-gray-500" : "text-blue-100"
          )}
        >
          {message.timestamp.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};
