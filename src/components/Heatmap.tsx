import React, { useEffect, useRef, useState } from "react";
import { Habit } from "@/types/habit";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  habits: Habit[];
}

const Heatmap = ({ habits }: HeatmapProps) => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  // Helpers to generate a series of weeks (each week is array of 7 day cells)
  const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun .. 6 Sat
    // Convert so Monday is start (1). If Sunday (0) -> subtract 6 days
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const addDays = (d: Date, daysToAdd: number) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + daysToAdd);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };

  const isSameDay = (a: Date, b: Date) => a.getTime() === b.getTime();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const generateWeek = (weekStart: Date, habit: Habit) => {
    return days.map((dayLabel, i) => {
      const date = addDays(weekStart, i);
      // simple mock: past days random complete, future future, today uses habit.status
      let status: "completed" | "missed" | "pending" | "future" = "future";
      if (date < today) {
        status = Math.random() > 0.25 ? "completed" : "missed";
      } else if (isSameDay(date, today)) {
        status = habit.status === "completed" ? "completed" : "pending";
      } else {
        status = "future";
      }

      return {
        day: dayLabel,
        date,
        status,
        percentage: status === "completed" ? 100 : 0,
      };
    });
  };

  const generateWeeks = (habit: Habit, weeksCount = 6) => {
    const currentWeekStart = startOfWeek(today);
    const weeks = [] as ReturnType<typeof generateWeek>[];
    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = addDays(currentWeekStart, -7 * i);
      weeks.push(generateWeek(weekStart, habit));
    }
    return weeks;
  };

  // Subcomponent: carousel for a single habit showing multiple weeks
  const HabitWeekCarousel: React.FC<{ habit: Habit }> = ({ habit }) => {
    const weeks = generateWeeks(habit, 6);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [active, setActive] = useState(weeks.length - 1); // start on current week

    useEffect(() => {
      // scroll to active on mount
      const el = containerRef.current;
      if (!el) return;
      const panels = el.querySelectorAll<HTMLElement>(".week-panel");
      const target = panels[active];
      if (target) target.scrollIntoView({ behavior: "auto", inline: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scrollTo = (idx: number) => {
      const el = containerRef.current;
      if (!el) return;
      const panels = el.querySelectorAll<HTMLElement>(".week-panel");
      const target = panels[idx];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", inline: "center" });
        setActive(idx);
      }
    };

    const onKeyDownContainer = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollTo(Math.max(0, active - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollTo(Math.min(weeks.length - 1, active + 1));
      }
    };

    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      const panels = Array.from(el.querySelectorAll<HTMLElement>(".week-panel"));
      const found = panels.findIndex((p) => p.offsetLeft <= center && p.offsetLeft + p.offsetWidth >= center);
      if (found !== -1 && found !== active) setActive(found);
    };

    return (
      <div className="relative">
        {/* arrows */}
        <button
          aria-label="Semana anterior"
          onClick={() => scrollTo(Math.max(0, active - 1))}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/40 backdrop-blur-sm p-2 rounded-full"
        >
          ‹
        </button>
        <button
          aria-label="Próxima semana"
          onClick={() => scrollTo(Math.min(weeks.length - 1, active + 1))}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/40 backdrop-blur-sm p-2 rounded-full"
        >
          ›
        </button>

        <div
          ref={containerRef}
          onScroll={onScroll}
          onKeyDown={onKeyDownContainer}
          tabIndex={0}
          role="region"
          aria-label={`Calendário semanal de ${habit.title}`}
          className="overflow-x-auto overflow-y-hidden -mx-4 px-4 py-2 scrollbar-none focus:outline-none"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          <div className="inline-flex items-start gap-6">
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="week-panel flex-shrink-0"
                style={{ minWidth: "calc(100% - 64px)", scrollSnapAlign: "center" }}
              >
                <div className="flex items-start gap-4 justify-center">
                  {week.map((cell, index) => (
                    <div key={index} className="w-24 sm:w-14 flex-shrink-0">
                      <div
                        className={cn(
                          "w-full aspect-square rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer group relative overflow-hidden",
                          "bg-slate-800/40 backdrop-blur-sm border border-violet-600/10",
                          cell.status === "completed" && "bg-violet-600/80 shadow-[0_8px_30px_rgba(139,92,246,0.26)] ring-2 ring-violet-400/30",
                          cell.status === "missed" && "bg-slate-700",
                          cell.status === "pending" && "bg-amber-500/80",
                          cell.status === "future" && "bg-slate-700/30 opacity-60"
                        )}
                      >
                        {cell.status === "completed" && (
                          <span className="absolute inset-0 pointer-events-none rounded-lg" style={{ boxShadow: "0 10px 40px rgba(139,92,246,0.28)" }} />
                        )}

                        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-violet-500/50 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          <div className="text-xs text-slate-50 font-medium">{cell.day}</div>
                          <div className="text-xs text-slate-300">
                            {cell.status === "completed" && "✓ Completado"}
                            {cell.status === "missed" && "✗ Não feito"}
                            {cell.status === "pending" && "⏳ Pendente"}
                            {cell.status === "future" && "Futuro"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-center text-slate-400 mt-1">{cell.day}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {weeks.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para semana ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn("w-2 h-2 rounded-full", i === active ? "bg-violet-400" : "bg-slate-700/40")}
            />
          ))}
        </div>

        {/* live region to announce active week for screen readers */}
        <div className="sr-only" aria-live="polite">
          {(() => {
            const wk = weeks[active];
            if (!wk) return "";
            const start = wk[0].date.toLocaleDateString();
            const end = wk[6].date.toLocaleDateString();
            return `Semana ativa: ${start} até ${end}`;
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl p-8 animate-fade-in w-full">
      <h2 className="text-2xl font-bold text-slate-50 mb-6">
        Progresso dos últimos 7 dias
      </h2>
      <div className="space-y-6">
        {habits.map((habit, habitIndex) => (
          <div key={habit.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-xl">
                {habitIndex === 0 ? "📚" : habitIndex === 1 ? "💪" : "💧"}
              </div>
              <span className="text-slate-200 font-medium">{habit.title}</span>
            </div>

            <HabitWeekCarousel habit={habit} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
