
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Home, MessageSquare, FileText, Calendar, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: MessageSquare, label: "Beratung", href: "/chat" },
    { icon: FileText, label: "Meine Angebote", href: "/offers" },
    { icon: Calendar, label: "Termine", href: "/appointments" },
    { icon: User, label: "Profil", href: "/profile" },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-16 bg-sidebar shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center p-2 border-b border-sidebar-border lg:hidden">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-sidebar-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <TooltipProvider>
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => {
                      // Handle navigation
                      onClose();
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>
      </aside>
    </>
  );
};
