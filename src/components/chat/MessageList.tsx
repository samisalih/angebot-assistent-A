
import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug: Log messages whenever they change
  useEffect(() => {
    console.log('Messages updated:', messages);
    console.log('Number of messages:', messages.length);
    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}: sender=${msg.sender}, content preview=${msg.content.substring(0, 50)}...`);
    });
  }, [messages]);

  return (
    <div className="flex-1 min-h-0">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {messages.map(message => {
            console.log('Rendering message:', message.id, message.sender);
            return <ChatMessage key={message.id} message={message} />;
          })}
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Bot className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Der Assistent tippt...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
