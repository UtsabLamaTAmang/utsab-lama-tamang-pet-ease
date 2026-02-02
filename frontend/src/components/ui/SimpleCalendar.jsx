import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SimpleCalendar({ selected, onSelect, className }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className={cn("p-3 w-full mx-auto bg-card rounded-md border shadow-sm", className)}>
            <div className="flex items-center justify-between mb-4 px-2">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-semibold text-sm">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 mb-2 text-center">
                {weekDays.map((day) => (
                    <div key={day} className="text-[0.8rem] font-medium text-muted-foreground w-9 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2">
                {calendarDays.map((day, dayIdx) => {
                    const isSelected = selected && isSameDay(day, selected);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDateToday = isToday(day);
                    const isDisabled = day < new Date(new Date().setHours(0, 0, 0, 0)); // Disable past days

                    return (
                        <div key={day.toString()} className="flex justify-center">
                            <button
                                onClick={() => !isDisabled && onSelect(day)}
                                disabled={isDisabled}
                                className={cn(
                                    "h-9 w-9 text-sm font-normal rounded-md flex items-center justify-center transition-colors",
                                    !isCurrentMonth && "text-muted-foreground/30",
                                    isCurrentMonth && "text-foreground",
                                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                    !isSelected && isCurrentMonth && !isDisabled && "hover:bg-accent hover:text-accent-foreground",
                                    isDisabled && "text-muted-foreground/50 opacity-50 cursor-not-allowed"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
