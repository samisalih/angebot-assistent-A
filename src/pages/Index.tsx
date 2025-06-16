
import { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { OfferDisplay } from "@/components/offers/OfferDisplay";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useOffer } from "@/contexts/OfferContext";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Offer } from "@/types/offer";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const { toast } = useToast();
  const { currentOffer, setCurrentOffer, setHasGeneratedOffer } = useOffer();

  const handleOfferGenerated = (offer: Offer) => {
    setCurrentOffer(offer);
    setHasGeneratedOffer(true);
    toast({
      title: "Angebot erstellt",
      description: "Ihr personalisiertes Angebot wurde erfolgreich generiert.",
    });
  };

  const handleResetChat = () => {
    // Clear offer state
    setCurrentOffer(null);
    setHasGeneratedOffer(false);
    
    // Force ChatInterface to remount and reset
    setResetKey(prev => prev + 1);
    
    toast({
      title: "Chat zurückgesetzt",
      description: "Chat und Angebot wurden erfolgreich zurückgesetzt.",
    });
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        onResetChat={handleResetChat}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-hidden p-4">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col">
              <div className="h-full overflow-hidden">
                <ChatInterface key={resetKey} onOfferGenerated={handleOfferGenerated} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col">
              <div className="h-full overflow-hidden">
                <OfferDisplay offer={currentOffer} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
};

export default Index;
