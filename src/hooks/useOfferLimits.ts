
import { useState } from 'react';
import { Message } from '@/types/message';
import { ConversationService } from '@/domain/ConversationService';
import { useToast } from '@/hooks/use-toast';

const MAX_OFFERS_PER_CHAT = 3;

export const useOfferLimits = () => {
  const [offersGenerated, setOffersGenerated] = useState(0);
  const { toast } = useToast();

  const canCreateOffer = (messages: Message[]): boolean => {
    return ConversationService.canCreateOffer(messages, offersGenerated);
  };

  const incrementOfferCount = (): boolean => {
    if (offersGenerated >= MAX_OFFERS_PER_CHAT) {
      toast({
        title: "Angebotslimit erreicht",
        description: `Sie können maximal ${MAX_OFFERS_PER_CHAT} Angebote pro Unterhaltung erstellen. Starten Sie eine neue Unterhaltung für weitere Angebote.`,
        variant: "destructive"
      });
      return false;
    }
    
    setOffersGenerated(prev => prev + 1);
    
    if (offersGenerated + 1 >= MAX_OFFERS_PER_CHAT) {
      toast({
        title: "Letztes Angebot erstellt",
        description: "Sie haben das Maximum von 3 Angeboten pro Unterhaltung erreicht.",
        variant: "default"
      });
    }
    
    return true;
  };

  return {
    offersGenerated,
    canCreateOffer,
    incrementOfferCount,
    maxOffers: MAX_OFFERS_PER_CHAT
  };
};
