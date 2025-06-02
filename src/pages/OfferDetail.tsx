
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OfferDisplay } from "@/components/offers/OfferDisplay";
import { useQuery } from "@tanstack/react-query";
import { getSavedOffers } from "@/services/offersService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface OfferData {
  description?: string;
  items?: Array<{
    name: string;
    description: string;
    price: number;
    quantity: number;
  }>;
  validUntil?: string | Date;
}

const OfferDetail = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: offers, isLoading, error } = useQuery({
    queryKey: ['saved-offers'],
    queryFn: getSavedOffers,
    enabled: isAuthenticated,
  });

  const selectedOffer = offers?.find(offer => offer.id === offerId);

  // Transform the saved offer data to match OfferDisplay's expected format
  const transformedOffer = selectedOffer ? {
    id: selectedOffer.id,
    title: selectedOffer.title,
    description: (selectedOffer.offer_data as OfferData)?.description || "Individuelles Angebot",
    items: (selectedOffer.offer_data as OfferData)?.items || [],
    totalPrice: selectedOffer.total_price,
    validUntil: (selectedOffer.offer_data as OfferData)?.validUntil || new Date(),
  } : null;

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <p className="text-muted-foreground">Laden...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !selectedOffer) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 overflow-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">
                Angebot nicht gefunden oder Fehler beim Laden.
              </p>
              <Button onClick={() => navigate("/offers")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zu Angeboten
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/offers")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zu Angeboten
              </Button>
            </div>
            <OfferDisplay offer={transformedOffer} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OfferDetail;
