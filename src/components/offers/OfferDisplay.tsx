
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Share2, Bookmark, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateOfferPDF } from "@/services/pdfService";
import { saveOffer } from "@/services/offersService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useNavigate } from "react-router-dom";
import { Offer } from "@/types/offer";
import { OfferValidationService } from "@/domain/OfferValidationService";
import { OfferBusinessRules } from "@/domain/OfferBusinessRules";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OfferDisplayProps {
  offer: Offer | null;
}

export const OfferDisplay = ({ offer }: OfferDisplayProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);

  const handleDownloadPDF = async () => {
    if (!offer) return;
    try {
      await generateOfferPDF(offer);
      toast({
        title: "PDF erstellt",
        description: "Ihr Angebot wurde erfolgreich als PDF heruntergeladen."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Fehler beim PDF-Export",
        description: "Es gab ein Problem beim Erstellen der PDF-Datei.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleAppointment = () => {
    navigate('/appointment');
  };

  const handleSaveOffer = async () => {
    if (!offer) return;
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    // Validate offer with business rules
    const validationErrors = OfferValidationService.validateOffer(offer);
    const businessRuleErrors = OfferBusinessRules.validateBusinessRules(offer);
    const allErrors = [...validationErrors, ...businessRuleErrors];

    if (allErrors.length > 0) {
      toast({
        title: "Ungültiges Angebot",
        description: allErrors[0], // Show first error
        variant: "destructive"
      });
      return;
    }

    setSavingOffer(true);
    try {
      await saveOffer(offer);
      toast({
        title: "Angebot gespeichert",
        description: "Das Angebot wurde erfolgreich in Ihrem Konto gespeichert."
      });
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Das Angebot konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setSavingOffer(false);
    }
  };

  const handleAuthSuccess = () => {
    if (offer) {
      setTimeout(() => {
        handleSaveOffer();
      }, 500);
    }
  };

  if (!offer) {
    return (
      <div className="h-full bg-card shadow-lg rounded-lg border flex items-center justify-center">
        <div className="text-center text-muted-foreground p-6 px-[15px]">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2 text-foreground">Noch kein Angebot</h3>
          <p className="text-sm">
            Beginnen Sie eine Unterhaltung mit unserem KI-Berater, um Ihr 
            personalisiertes Angebot zu erhalten.
          </p>
        </div>
      </div>
    );
  }

  const validUntilDate = typeof offer.validUntil === 'string' ? new Date(offer.validUntil) : offer.validUntil;
  const isExpired = OfferValidationService.isOfferExpired(offer);
  const businessRuleErrors = OfferBusinessRules.validateBusinessRules(offer);
  const offerSummary = OfferBusinessRules.generateOfferSummary(offer);

  return (
    <>
      <div className="h-full bg-card shadow-lg rounded-lg border flex flex-col">
        <CardHeader className="bg-gradient-to-r from-muted to-accent/20 flex-shrink-0 rounded-t-lg">
          <CardTitle className="text-xl text-foreground">{offer.title}</CardTitle>
          <p className="text-muted-foreground text-sm">{offer.description}</p>
          <p className="text-xs text-muted-foreground">{offerSummary}</p>
          {isExpired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Dieses Angebot ist abgelaufen
              </AlertDescription>
            </Alert>
          )}
          {businessRuleErrors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Hinweise: {businessRuleErrors.slice(0, 2).join(', ')}
                {businessRuleErrors.length > 2 && ` (+${businessRuleErrors.length - 2} weitere)`}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Leistungen:</h4>
                {offer.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground">{item.name}</h5>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <span className="text-xs text-muted-foreground opacity-70">
                        {item.quantity}h × {item.price.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR"
                        })}/h
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-foreground">
                        {(item.price * item.quantity).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR"
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">
                    Gesamtpreis:
                  </span>
                  <span className="text-2xl font-bold text-accent">
                    {offer.totalPrice.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR"
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Gültig bis: {validUntilDate.toLocaleDateString("de-DE")}
                </p>
              </div>
            </CardContent>
          </ScrollArea>
        </div>

        <div className="p-6 pt-0 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button onClick={handleDownloadPDF} className="w-full" disabled={isExpired}>
              <Download className="h-4 w-4 mr-2" />
              PDF Download
            </Button>
            <Button 
              onClick={handleScheduleAppointment} 
              variant="outline" 
              className="w-full border-accent/50 text-accent hover:bg-accent/10"
              disabled={isExpired}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Termin vereinbaren
            </Button>
          </div>
          <Button 
            onClick={handleSaveOffer} 
            disabled={savingOffer || isExpired} 
            variant="outline" 
            className="w-full"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            {savingOffer ? 'Speichern...' : 'Angebot speichern'}
          </Button>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} onSuccess={handleAuthSuccess} />
    </>
  );
};
