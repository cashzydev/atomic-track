import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { getIconComponent } from '@/config/icon-map';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Habit } from "@/types/habit";

interface HabitStackSelectorProps {
  habits: Habit[];
  value: number | null;
  onChange: (habitId: number | null, habit?: Habit) => void;
}

export function HabitStackSelector({ habits, value, onChange }: HabitStackSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedHabit = habits.find((h) => h.id === value);

  if (habits.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background border-input hover:bg-muted/50"
        >
          {selectedHabit ? (
            <div className="flex items-center gap-2">
              {selectedHabit.icon && React.createElement(getIconComponent(selectedHabit.icon), { className: 'w-4 h-4' })}
              <span>{selectedHabit.title}</span>
            </div>
          ) : (
            "Selecione um hábito..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar hábito..." />
          <CommandEmpty>Nenhum hábito encontrado</CommandEmpty>
          <CommandGroup>
            {habits.map((habit) => (
              <CommandItem
                key={habit.id}
                value={habit.title}
                onSelect={() => {
                  onChange(value === habit.id ? null : habit.id, habit);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === habit.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {habit.icon && React.createElement(getIconComponent(habit.icon), { className: 'w-4 h-4 opacity-80 mr-1' })}
                  <span>{habit.title}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
