
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface OfferRequestButtonProps {
  onRequestOffer: () => void;
  isEnabled: boolean;
  isLoading: boolean;
  messageCount: number;
  canCreateOffer: boolean;
}

export const OfferRequestButton = ({ 
  onRequestOffer, 
  isEnabled, 
  isLoading, 
  messageCount, 
  canCreateOffer 
}: OfferRequestButtonProps) => {
  const getTooltipText = () => {
    if (!canCreateOffer) {
      return "Bitte senden Sie mindestens 5 Nachrichten mit jeweils mehr als 50 Wörtern, um ein Angebot zu erstellen.";
    }
    if (messageCount >= 50) {
      return "Nachrichtenlimit erreicht";
    }
    return "";
  };

  return (
    <div className="flex justify-center">
      <Button 
        onClick={onRequestOffer} 
        disabled={!isEnabled} 
        variant="outline" 
        className="border-accent/50 text-accent hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed" 
        title={getTooltipText()}
      >
        <FileText className="h-4 w-4 mr-2" />
        Explizit Angebot anfordern
      </Button>
    </div>
  );
};
