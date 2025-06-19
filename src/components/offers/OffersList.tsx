
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Euro, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteSavedOffer, SavedOffer } from "@/services/offersService";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface OffersListProps {
  offers?: SavedOffer[];
  isLoading?: boolean;
}

export const OffersList = ({ offers, isLoading }: OffersListProps) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleDeleteOffer = async (offerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      await deleteSavedOffer(offerId);
      queryClient.invalidateQueries({ queryKey: ['saved-offers'] });
      toast({
        title: "Angebot gelöscht",
        description: "Das Angebot wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Das Angebot konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleOfferClick = (offerId: string) => {
    navigate(`/offers/${offerId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Bitte melden Sie sich an, um Ihre gespeicherten Angebote zu sehen.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Sie haben noch keine Angebote gespeichert.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer: SavedOffer) => {
        // Parse the offer data to get the validUntil date
        const offerData = offer.offer_data;
        const validUntilDate = offerData?.validUntil 
          ? new Date(offerData.validUntil) 
          : null;

        return (
          <Card 
            key={offer.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleOfferClick(offer.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{offer.title}</span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteOffer(offer.id, e)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  <span className="font-semibold text-foreground">
                    {offer.total_price.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
                {validUntilDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Gültig bis: {validUntilDate.toLocaleDateString("de-DE")}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Erstellt am: {new Date(offer.created_at).toLocaleDateString("de-DE")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
