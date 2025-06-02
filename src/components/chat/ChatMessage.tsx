
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';

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
        <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-accent-foreground" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
          isAssistant
            ? "bg-muted text-muted-foreground"
            : "bg-accent text-accent-foreground"
        )}
      >
        {isAssistant ? (
          <ReactMarkdown 
            className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-0">{children}</li>,
              h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                ) : (
                  <code className="block bg-background/50 p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto">{children}</code>
                );
              },
              pre: ({ children }) => <pre className="bg-background/50 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-border pl-2 italic mb-2">{children}</blockquote>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        <p
          className={cn(
            "text-xs mt-1 opacity-70"
          )}
        >
          {message.timestamp.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
