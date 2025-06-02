
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TimeSlotGrid } from "./TimeSlotGrid";

export const AppointmentBooking = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Bitte wählen Sie Datum und Uhrzeit",
        description: "Sowohl ein Datum als auch eine Uhrzeit müssen ausgewählt werden.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Termin erfolgreich gebucht",
      description: `Ihr Termin am ${selectedDate.toLocaleDateString("de-DE")} um ${selectedTime} wurde gebucht.`,
    });

    // Reset selections
    setSelectedTime(null);
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
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      onClick={handleBookAppointment}
                      disabled={!selectedTime}
                      className="w-full"
                    >
                      Termin buchen
                      {selectedTime && ` (${selectedTime})`}
                    </Button>
                  </div>
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
