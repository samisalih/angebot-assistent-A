
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, FileText, MessageSquare, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppointments, deleteAppointment } from "@/services/appointmentsService";
import { getSavedOffers, deleteSavedOffer } from "@/services/offersService";
import { getUserConversation, deleteConversation } from "@/services/conversationsService";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    enabled: isAuthenticated,
  });

  const { data: offers } = useQuery({
    queryKey: ['saved-offers'],
    queryFn: getSavedOffers,
    enabled: isAuthenticated,
  });

  const { data: conversation } = useQuery({
    queryKey: ['conversation'],
    queryFn: getUserConversation,
    enabled: isAuthenticated,
  });

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Termin gelöscht",
        description: "Der Termin wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Der Termin konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      await deleteSavedOffer(offerId);
      queryClient.invalidateQueries({ queryKey: ['saved-offers'] });
      toast({
        title: "Angebot gelöscht",
        description: "Das Angebot wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Das Angebot konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      toast({
        title: "Unterhaltung gelöscht",
        description: "Die Unterhaltung wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Unterhaltung konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <main className="flex-1 overflow-hidden p-4 flex items-center justify-center">
            <div className="text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
              <p className="text-muted-foreground">
                Bitte melden Sie sich an, um Ihr Profil zu sehen.
              </p>
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
          <div className="max-w-6xl mx-auto space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Angemeldet als: <span className="font-semibold text-foreground">{user.email}</span>
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Termine ({Array.isArray(appointments) ? appointments.length : 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointments && Array.isArray(appointments) && appointments.length > 0 ? (
                    appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">
                          <div className="font-medium">{appointment.customer_name}</div>
                          <div className="text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleDateString("de-DE")} um {appointment.appointment_time}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Keine Termine vorhanden</p>
                  )}
                </CardContent>
              </Card>

              {/* Offers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Angebote ({Array.isArray(offers) ? offers.length : 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {offers && Array.isArray(offers) && offers.length > 0 ? (
                    offers.slice(0, 3).map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">
                          <div className="font-medium">{offer.title}</div>
                          <div className="text-muted-foreground">
                            {offer.total_price.toLocaleString("de-DE", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Keine Angebote vorhanden</p>
                  )}
                </CardContent>
              </Card>

              {/* Conversation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Unterhaltung ({conversation ? 1 : 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conversation ? (
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="text-sm">
                        <div className="font-medium">{conversation.title || 'Unterhaltung'}</div>
                        <div className="text-muted-foreground">
                          {new Date(conversation.updated_at).toLocaleDateString("de-DE")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConversation(conversation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Keine Unterhaltung vorhanden</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
