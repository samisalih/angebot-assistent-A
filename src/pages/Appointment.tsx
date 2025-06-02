
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOffer } from "@/contexts/OfferContext";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppointmentBooking } from "@/components/appointment/AppointmentBooking";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";

const Appointment = () => {
  const { user } = useAuth();
  const { hasGeneratedOffer } = useOffer();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(!user);

  if (!user) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 overflow-hidden p-4 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
              <p className="text-muted-foreground mb-6">
                Bitte melden Sie sich an, um einen Termin zu vereinbaren.
              </p>
            </div>
          </main>
        </div>

        <AuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen}
          onSuccess={() => setAuthDialogOpen(false)}
        />
      </div>
    );
  }

  if (!hasGeneratedOffer) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 overflow-hidden p-4 flex items-center justify-center">
            <div className="text-center max-w-md">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4">Angebot erforderlich</h1>
              <p className="text-muted-foreground mb-6">
                Um einen Termin zu vereinbaren, müssen Sie zuerst ein Angebot über unseren Beratungs-Chat erstellen lassen.
              </p>
              <Button asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zur Beratung
                </Link>
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
        
        <main className="flex-1 overflow-hidden p-4">
          <AppointmentBooking />
        </main>
      </div>
    </div>
  );
};

export default Appointment;
