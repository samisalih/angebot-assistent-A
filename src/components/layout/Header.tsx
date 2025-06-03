
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/auth/AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAuthButtonClick = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
    }
  };

  return (
    <>
      <header className="bg-transparent">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu Button */}
            <div className="flex items-center">
              <div className="app-info flex items-center gap-2">
                {/* Menu Button */}
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMenuClick}
                      className="lg:hidden"
                    >
                      <Menu className="h-5 w-5" />
                  </Button>
                <img src="/digitalwert-Logo-weiss.svg" alt="Digitalwert Logo" className="h-5" />
                <h1 className="font-semibold">Virtueller Berater</h1>
              </div>
            </div>

            {/* User Authentication Status */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Abmelden</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-2"
                  onClick={handleAuthButtonClick}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Nicht angemeldet</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onSuccess={() => setAuthDialogOpen(false)}
      />
    </>
  );
};
