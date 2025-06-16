
import { useState } from "react";
import { Menu, LogOut, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/auth/AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useOffer } from "@/contexts/OfferContext";

interface HeaderProps {
  onMenuClick: () => void;
  onResetChat?: () => void;
}

export const Header = ({ onMenuClick, onResetChat }: HeaderProps) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { setCurrentOffer, setHasGeneratedOffer } = useOffer();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setAuthDialogOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleResetChat = () => {
    // Reset offer context
    setCurrentOffer(null);
    setHasGeneratedOffer(false);
    
    // Clear localStorage for offers
    localStorage.removeItem('currentOffer');
    localStorage.removeItem('hasGeneratedOffer');
    
    // Clear localStorage for chat messages (both general and user-specific)
    localStorage.removeItem('chat_messages');
    if (user) {
      const userStorageKey = `chat_messages_${user.id}`;
      localStorage.removeItem(userStorageKey);
    }
    
    // Call parent reset function to reset messages
    if (onResetChat) {
      onResetChat();
    }
  };

  return (
    <>
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <img 
              src="/digitalwert-Logo-blau.svg" 
              alt="Digitalwert Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-bold text-foreground hidden sm:block">
              KI-Berater
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Chat zurücksetzen</span>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/offers')}>
                  <User className="mr-2 h-4 w-4" />
                  Meine Angebote
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} size="sm">
              Anmelden
            </Button>
          )}
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
};
