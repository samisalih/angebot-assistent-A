
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const AppointmentBooking = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Bitte wählen Sie Datum und Uhrzeit",
        description: "Sowohl ein Datum als auch eine Uhrzeit müssen ausgewählt werden.",
        variant: "destructive",
      });
      return;
    }

    if (!customerName || !customerEmail) {
      toast({
        title: "Bitte füllen Sie alle Felder aus",
        description: "Name und E-Mail-Adresse sind erforderlich.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      // Send appointment confirmation email
      const { data, error } = await supabase.functions.invoke('send-appointment-confirmation', {
        body: {
          customerEmail,
          customerName,
          appointmentDate: selectedDate.toLocaleDateString("de-DE", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          appointmentTime: selectedTime,
          companyName: "Ihr Beratungsunternehmen",
          companyAddress: "Musterstraße 123, 12345 Musterstadt",
          companyPhone: "+49 123 456789",
          companyEmail: "info@beispiel.de",
        },
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        toast({
          title: "E-Mail-Versand fehlgeschlagen",
          description: "Der Termin wurde gebucht, aber die Bestätigungs-E-Mail konnte nicht gesendet werden.",
          variant: "destructive",
        });
      } else {
        console.log('Confirmation email sent:', data);
        toast({
          title: "Termin erfolgreich gebucht",
          description: `Ihr Termin am ${selectedDate.toLocaleDateString("de-DE")} um ${selectedTime} wurde gebucht. Eine Bestätigungs-E-Mail wurde an ${customerEmail} gesendet.`,
        });
      }

      // Reset form
      setSelectedTime(null);
      setCustomerName("");
      setCustomerEmail("");

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Fehler beim Buchen",
        description: "Es gab einen Fehler beim Buchen Ihres Termins. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Termin vereinbaren</h1>
        <p className="text-muted-foreground mt-2">
          Wählen Sie ein Datum und eine Uhrzeit für Ihren Beratungstermin.
        </p>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100%-120px)]">
        {/* Calendar Panel */}
        <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Datum wählen</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                className="h-full w-full"
              />
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Time Slots Panel */}
        <ResizablePanel defaultSize={60} minSize={40} className="flex flex-col">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                Uhrzeit wählen
                {selectedDate && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    für {selectedDate.toLocaleDateString("de-DE")}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {selectedDate ? (
                <>
                  <TimeSlotGrid
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                  />
                  
                  {/* Customer Information Form */}
                  {selectedTime && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerName">Name *</Label>
                          <Input
                            id="customerName"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Ihr Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerEmail">E-Mail *</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="ihre.email@beispiel.de"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleBookAppointment}
                        disabled={!selectedTime || !customerName || !customerEmail || isBooking}
                        className="w-full"
                      >
                        {isBooking ? "Wird gebucht..." : `Termin buchen (${selectedTime})`}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Bitte wählen Sie zuerst ein Datum aus.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
