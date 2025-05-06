'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TimelineSelection {
  date: Date;
  startTime: string;
  endTime: string;
}

interface DesignTimelinePickerProps {
  value: TimelineSelection;
  onChange: (value: TimelineSelection) => void;
}

export function DesignTimelinePicker({ value, onChange }: DesignTimelinePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange({
        ...value,
        date
      });
    }
    setIsCalendarOpen(false);
  };

  // Handle time change (start or end)
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, timeType: 'startTime' | 'endTime') => {
    onChange({
      ...value,
      [timeType]: e.target.value
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium text-gray-300">
            Select Date
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700",
                  !value.date && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.date ? format(value.date, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border border-gray-700">
              <Calendar
                mode="single"
                selected={value.date}
                onSelect={handleDateSelect}
                initialFocus
                className="bg-gray-800 text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">
              Start Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="time"
                id="startTime"
                value={value.startTime}
                onChange={(e) => handleTimeChange(e, 'startTime')}
                className="w-full pl-10 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-300">
              End Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="time"
                id="endTime"
                value={value.endTime}
                onChange={(e) => handleTimeChange(e, 'endTime')}
                className="w-full pl-10 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 