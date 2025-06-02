
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Edit, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  title: string;
  description: string;
  items: Array<{
    name: string;
    description: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  validUntil: Date;
}

interface OfferDisplayProps {
  offer: Offer | null;
}

export const OfferDisplay = ({ offer }: OfferDisplayProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    toast({
      title: "PDF wird generiert",
      description: "Ihr Angebot wird als PDF vorbereitet...",
    });
    // TODO: Implement PDF generation
  };

  const handleScheduleAppointment = () => {
    toast({
      title: "Termin vereinbaren",
      description: "Sie werden zur Terminbuchung weitergeleitet...",
    });
    // TODO: Implement appointment scheduling
  };

  const handleEditOffer = () => {
    toast({
      title: "Angebot bearbeiten",
      description: "Sie können nun Änderungen an Ihrem Angebot vornehmen...",
    });
    // TODO: Implement offer editing
  };

  if (!offer) {
    return (
      <Card className="h-[600px] bg-white shadow-lg">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-lg mb-2">Noch kein Angebot</h3>
            <p className="text-sm">
              Beginnen Sie eine Unterhaltung mit unserem KI-Berater, um Ihr 
              personalisiertes Angebot zu erhalten.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl text-gray-900">{offer.title}</CardTitle>
        <p className="text-gray-600 text-sm">{offer.description}</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Offer Items */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Leistungen:</h4>
          {offer.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{item.name}</h5>
                <p className="text-sm text-gray-600">{item.description}</p>
                <span className="text-xs text-gray-500">
                  Menge: {item.quantity}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {(item.price * item.quantity).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">
              Gesamtpreis:
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {offer.totalPrice.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gültig bis: {offer.validUntil.toLocaleDateString("de-DE")}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleDownloadPDF} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            PDF Download
          </Button>
          <Button onClick={handleEditOffer} variant="outline" className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>
        
        <Button 
          onClick={handleScheduleAppointment} 
          variant="outline" 
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Beratungstermin vereinbaren
        </Button>
      </CardContent>
    </Card>
  );
};
