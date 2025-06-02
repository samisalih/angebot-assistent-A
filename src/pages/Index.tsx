
import { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { OfferDisplay } from "@/components/offers/OfferDisplay";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Chat Interface Panel */}
            <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col">
              <div className="h-full overflow-hidden">
                <ChatInterface onOfferGenerated={handleOfferGenerated} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Offer Display Panel */}
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
