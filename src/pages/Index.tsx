
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 flex flex-col">
          <div className="p-4 lg:p-6">
            <div className="text-center lg:text-left mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ihr KI-Berater
              </h1>
              <p className="text-lg text-muted-foreground">
                Lassen Sie sich von unserem intelligenten Assistenten beraten und 
                erhalten Sie ein maßgeschneidertes Angebot für Ihre Bedürfnisse.
              </p>
            </div>
          </div>

          <div className="flex-1 px-4 lg:px-6 pb-4 lg:pb-6">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Chat Interface Panel */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full pr-2">
                  <ChatInterface onOfferGenerated={handleOfferGenerated} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Offer Display Panel */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full pl-2">
                  <OfferDisplay offer={currentOffer} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
