import React, { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState<Date | null>(value || null);

  useEffect(() => {
    if (value) {
      setDate(value);
      setTime(format(value, "HH:mm"));
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(":");
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setDate(newDate);
      onChange?.(newDate);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setDate(newDate);
      onChange?.(newDate);
    }
  };

  return (
    <div className="flex w-full gap-4">
      <div className="flex flex-col w-full">
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between pl-3 text-left font-normal"
            >
              {date ? (
                format(date, "PPP")
              ) : (
                <span className="text-muted-foreground">Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </Popover.Trigger>
          <Popover.Content
            side="bottom"
            align="start"
            className="w-auto p-0 bg-white shadow-md rounded-lg"
          >
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
          </Popover.Content>
        </Popover.Root>
      </div>
      <div className="flex flex-col">
        <Select value={time} onValueChange={handleTimeChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-60">
              {Array.from({ length: 96 }).map((_, i) => {
                const hour = Math.floor(i / 4)
                  .toString()
                  .padStart(2, "0");
                const minute = ((i % 4) * 15).toString().padStart(2, "0");
                const timeStr = `${hour}:${minute}`;
                return (
                  <SelectItem key={i} value={timeStr}>
                    {timeStr}
                  </SelectItem>
                );
              })}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DateTimePicker;
