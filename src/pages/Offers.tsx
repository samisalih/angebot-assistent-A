import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OffersList } from "@/components/offers/OffersList";
import { OfferAnalytics } from "@/components/offers/OfferAnalytics";
import { OfferFilters } from "@/components/offers/OfferFilters";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSavedOffers, SavedOffer } from "@/services/offersService";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Offers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filteredOffers, setFilteredOffers] = useState<SavedOffer[]>([]);
  const { isAuthenticated } = useAuth();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['saved-offers'],
    queryFn: getSavedOffers,
    enabled: isAuthenticated,
  });

  // Update filtered offers when offers data changes
  useEffect(() => {
    if (offers) {
      setFilteredOffers(offers);
    }
  }, [offers]);

  const handleFilteredOffersChange = (filtered: SavedOffer[]) => {
    setFilteredOffers(filtered);
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 mr-3 text-primary" />
              <h1 className="text-3xl font-bold">Meine Angebote</h1>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <OfferFilters 
                  offers={offers} 
                  onFilteredOffersChange={handleFilteredOffersChange}
                />
                <OffersList offers={filteredOffers} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <OfferAnalytics offers={offers} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Offers;
