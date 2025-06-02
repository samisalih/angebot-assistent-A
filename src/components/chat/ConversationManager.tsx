
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getConversations, deleteConversation, updateConversation, saveConversation } from "@/services/conversationsService";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface ConversationManagerProps {
  currentConversationId: string | null;
  onConversationChange: (conversationId: string | null, messages: Message[]) => void;
  currentMessages: Message[];
}

export const ConversationManager = ({
  currentConversationId,
  onConversationChange,
  currentMessages,
}: ConversationManagerProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const data = await getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [isAuthenticated, user]);

  const handleNewConversation = async () => {
    if (conversations.length >= 3) {
      toast({
        title: "Limit erreicht",
        description: "Sie können maximal 3 Unterhaltungen haben. Löschen Sie eine bestehende Unterhaltung, um eine neue zu erstellen.",
        variant: "destructive",
      });
      return;
    }

    // Start a new conversation with default welcome message
    const welcomeMessage: Message = {
      id: "1",
      content: "Hallo! Ich bin Ihr KI-Berater. Erzählen Sie mir von Ihren Bedürfnissen und ich helfe Ihnen dabei, das perfekte Angebot zu erstellen. Womit kann ich Ihnen heute helfen?",
      sender: "assistant",
      timestamp: new Date(),
    };

    onConversationChange(null, [welcomeMessage]);
    
    toast({
      title: "Neue Unterhaltung",
      description: "Eine neue Unterhaltung wurde gestartet.",
    });
  };

  const handleLoadConversation = (conversation: any) => {
    const messages = conversation.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    
    onConversationChange(conversation.id, messages);
    
    toast({
      title: "Unterhaltung geladen",
      description: `Unterhaltung "${conversation.title}" wurde geladen.`,
    });
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    
    try {
      await deleteConversation(conversationId);
      await loadConversations();
      
      // If we deleted the current conversation, start a new one
      if (currentConversationId === conversationId) {
        handleNewConversation();
      }
      
      toast({
        title: "Unterhaltung gelöscht",
        description: "Die Unterhaltung wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Unterhaltung.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const getCurrentConversationTitle = () => {
    if (!currentConversationId) return "Neue Unterhaltung";
    const current = conversations.find(c => c.id === currentConversationId);
    return current?.title || "Unterhaltung";
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{getCurrentConversationTitle()}</span>
        <span className="text-xs text-muted-foreground">
          ({conversations.length}/3)
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {conversations.map((conversation) => (
              <DropdownMenuItem
                key={conversation.id}
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => handleLoadConversation(conversation)}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {conversation.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.updated_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  disabled={loading}
                  className="ml-2 h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))}
            {conversations.length === 0 && (
              <DropdownMenuItem disabled>
                <span className="text-sm text-muted-foreground">Keine Unterhaltungen vorhanden</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewConversation}
          disabled={conversations.length >= 3}
          title={conversations.length >= 3 ? "Maximal 3 Unterhaltungen erlaubt" : "Neue Unterhaltung"}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
