
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OffersList } from "@/components/offers/OffersList";
import { FileText } from "lucide-react";

const Offers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <FileText className="h-8 w-8 mr-3 text-primary" />
              <h1 className="text-3xl font-bold">Meine Angebote</h1>
            </div>
            <OffersList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Offers;
