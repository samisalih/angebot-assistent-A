
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface OfferRequestButtonProps {
  onRequestOffer: () => void;
  isEnabled: boolean;
  isLoading: boolean;
  messageCount: number;
  canCreateOffer: boolean;
  offersGenerated: number;
  maxOffers: number;
}

export const OfferRequestButton = ({ 
  onRequestOffer, 
  isEnabled, 
  isLoading, 
  messageCount, 
  canCreateOffer,
  offersGenerated,
  maxOffers
}: OfferRequestButtonProps) => {
  const getTooltipText = () => {
    if (offersGenerated >= maxOffers) {
      return `Sie haben bereits ${maxOffers} Angebote in dieser Unterhaltung erstellt. Starten Sie eine neue Unterhaltung für weitere Angebote.`;
    }
    if (!canCreateOffer) {
      return "Bitte senden Sie mindestens 5 Nachrichten mit jeweils mehr als 50 Wörtern, um ein Angebot zu erstellen.";
    }
    if (messageCount >= 50) {
      return "Nachrichtenlimit erreicht";
    }
    return "";
  };

  const getButtonText = () => {
    if (offersGenerated >= maxOffers) {
      return "Angebotslimit erreicht";
    }
    return `Explizit Angebot anfordern (${offersGenerated}/${maxOffers})`;
  };

  return (
    <div className="flex justify-center">
      <Button 
        onClick={onRequestOffer} 
        disabled={!isEnabled || offersGenerated >= maxOffers} 
        variant="outline" 
        className="border-accent/50 text-accent hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed" 
        title={getTooltipText()}
      >
        <FileText className="h-4 w-4 mr-2" />
        {getButtonText()}
      </Button>
    </div>
  );
};
