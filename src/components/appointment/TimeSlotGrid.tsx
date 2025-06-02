
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeSlotGridProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export const TimeSlotGrid = ({ selectedDate, selectedTime, onTimeSelect }: TimeSlotGridProps) => {
  // Generate time slots from 9:00 to 17:00 with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Simulate some booked slots (in a real app, this would come from an API)
  const bookedSlots = ["09:30", "10:00", "14:00", "15:30"];

  const isSlotBooked = (time: string) => {
    return bookedSlots.includes(time);
  };

  const isSlotInPast = (time: string) => {
    const now = new Date();
    const slotDate = new Date(selectedDate);
    const [hours, minutes] = time.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    
    return slotDate < now;
  };

  return (
    <div className="grid grid-cols-4 gap-2 flex-1 overflow-auto">
      {timeSlots.map((time) => {
        const isBooked = isSlotBooked(time);
        const isPast = isSlotInPast(time);
        const isSelected = selectedTime === time;
        const isDisabled = isBooked || isPast;

        return (
          <Button
            key={time}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            disabled={isDisabled}
            onClick={() => onTimeSelect(time)}
            className={cn(
              "h-12 text-sm",
              isSelected && "bg-primary text-primary-foreground",
              isBooked && "bg-destructive/10 text-destructive cursor-not-allowed",
              isPast && "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {time}
            {isBooked && (
              <span className="text-xs block">Belegt</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
