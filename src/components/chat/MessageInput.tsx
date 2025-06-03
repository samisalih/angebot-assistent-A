
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
  placeholder?: string;
}

export const MessageInput = ({ 
  onSend, 
  isLoading, 
  isDisabled, 
  placeholder = "Beschreiben Sie Ihre Bedürfnisse... (Shift+Enter für neue Zeile)" 
}: MessageInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading || isDisabled) return;
    onSend(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex space-x-2">
      <Textarea 
        value={input} 
        onChange={e => setInput(e.target.value)} 
        onKeyDown={handleKeyPress} 
        placeholder={placeholder}
        disabled={isLoading || isDisabled} 
        className="flex-1 min-h-[60px] max-h-[120px] resize-none" 
        rows={2} 
      />
      <Button 
        onClick={handleSend} 
        disabled={isLoading || !input.trim() || isDisabled} 
        className="self-end"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
