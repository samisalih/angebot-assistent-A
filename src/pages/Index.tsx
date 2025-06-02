
import { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { OfferDisplay } from "@/components/offers/OfferDisplay";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentOffer, setCurrentOffer] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleOfferGenerated = (offer: any) => {
    setCurrentOffer(offer);
    toast({
      title: "Angebot erstellt",
      description: "Ihr personalisiertes Angebot wurde erfolgreich generiert.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 container mx-auto px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Chat Interface */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Ihr KI-Berater
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Lassen Sie sich von unserem intelligenten Assistenten beraten und 
                  erhalten Sie ein maßgeschneidertes Angebot für Ihre Bedürfnisse.
                </p>
              </div>
              
              <ChatInterface onOfferGenerated={handleOfferGenerated} />
            </div>

            {/* Offer Display */}
            <div className="space-y-6">
              <OfferDisplay offer={currentOffer} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
