
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOffer } from "@/contexts/OfferContext";
import { useAuth } from "@/contexts/AuthContext";
import { getSavedOffers } from "@/services/offersService";
import { Euro, Calendar } from "lucide-react";

interface OfferOption {
  id: string;
  title: string;
  totalPrice: number;
  validUntil?: string | Date;
  source: 'current' | 'saved';
}

interface OfferSelectorProps {
  selectedOfferId: string | null;
  onOfferSelect: (offerId: string | null, offerData: any) => void;
}

export const OfferSelector = ({ selectedOfferId, onOfferSelect }: OfferSelectorProps) => {
  const [offers, setOffers] = useState<OfferOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentOffer, hasGeneratedOffer } = useOffer();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadOffers = async () => {
      const availableOffers: OfferOption[] = [];

      // Add current session offer if it exists
      if (hasGeneratedOffer && currentOffer) {
        availableOffers.push({
          id: 'current-offer',
          title: currentOffer.title || 'Aktuelles Angebot',
          totalPrice: currentOffer.totalPrice || 0,
          validUntil: currentOffer.validUntil,
          source: 'current'
        });
      }

      // Add saved offers if user is authenticated
      if (isAuthenticated) {
        try {
          const savedOffers = await getSavedOffers();
          savedOffers.forEach(offer => {
            let validUntil;
            if (offer.offer_data && typeof offer.offer_data === 'object' && 'validUntil' in offer.offer_data) {
              validUntil = offer.offer_data.validUntil as string;
            }
            
            availableOffers.push({
              id: offer.id,
              title: offer.title,
              totalPrice: offer.total_price,
              validUntil: validUntil,
              source: 'saved'
            });
          });
        } catch (error) {
          console.error('Error loading saved offers:', error);
        }
      }

      setOffers(availableOffers);
      setIsLoading(false);
    };

    loadOffers();
  }, [hasGeneratedOffer, currentOffer, isAuthenticated]);

  const handleOfferSelect = (offerId: string) => {
    const selectedOffer = offers.find(offer => offer.id === offerId);
    if (selectedOffer) {
      let offerData;
      if (selectedOffer.source === 'current') {
        offerData = currentOffer;
      } else {
        // For saved offers, we'll need to fetch the full data
        offerData = {
          title: selectedOffer.title,
          totalPrice: selectedOffer.totalPrice,
          validUntil: selectedOffer.validUntil
        };
      }
      onOfferSelect(offerId, offerData);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Label>Angebot auswählen</Label>
        <div className="h-10 bg-muted rounded-md flex items-center px-3">
          Laden...
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div>
        <Label>Angebot auswählen</Label>
        <div className="h-10 bg-muted rounded-md flex items-center px-3 text-muted-foreground">
          Keine Angebote verfügbar
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="offer-select">Angebot auswählen *</Label>
      <Select value={selectedOfferId || ""} onValueChange={handleOfferSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Wählen Sie ein Angebot aus" />
        </SelectTrigger>
        <SelectContent className="p-2">
          {offers.map((offer) => {
            const validUntilDate = offer.validUntil ? new Date(offer.validUntil) : null;
            return (
              <SelectItem key={offer.id} value={offer.id} className="p-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{offer.title}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {offer.source === 'current' ? 'Aktuell' : 'Gespeichert'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 pt-1">
                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      <span>{offer.totalPrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>
                    </div>
                    {validUntilDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>bis {validUntilDate.toLocaleDateString("de-DE")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
