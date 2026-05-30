"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type ProgressState = {
  discover: boolean;
  learn: boolean;
  quiz: boolean;
};

export function DailyProgressWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    discover: false,
    learn: false,
    quiz: false,
  });
  const [mounted, setMounted] = useState(false);

  // Initialize and check midnight reset
  useEffect(() => {
    setMounted(true);
    
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const lastActiveDate = localStorage.getItem("last_active_date");
    
    if (lastActiveDate !== today) {
      const resetState = { discover: false, learn: false, quiz: false };
      setProgress(resetState);
      localStorage.setItem("daily_progress_state", JSON.stringify(resetState));
      localStorage.setItem("last_active_date", today);
    } else {
      const savedState = localStorage.getItem("daily_progress_state");
      if (savedState) {
        try {
          setProgress(JSON.parse(savedState));
        } catch (e) {
          console.error("Failed to parse progress state", e);
        }
      }
    }
  }, []);

  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent = (completedCount / 3) * 100;

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="relative w-full max-w-[304px] mx-auto font-dm-sans">
      {/* Overlay Dropdown */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 w-full bg-[#010101] p-2 pb-3 rounded-[8px] shadow-2xl z-50">
          <div className="bg-white rounded-[4px] p-3 flex flex-col gap-3">
            <TaskItem done={progress.discover} title="Discover Vocabulary" />
            <div className="w-full border-b border-dashed border-[#E2E3ED]" />
            <TaskItem done={progress.learn} title="Learn Vocabulary" />
            <div className="w-full border-b border-dashed border-[#E2E3ED]" />
            <TaskItem done={progress.quiz} title="Review with a quick quiz" />
            <div className="w-full border-b border-dashed border-[#E2E3ED]" />
            
            <p className="text-[#657084] text-[12px] leading-[1.44] text-center mt-2 px-2">
              This exercise is designed to make your vocabulary ready to use when you take the test.
            </p>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="w-full flex flex-col gap-0 p-[4px] bg-[#010101] rounded-[8px]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-auto bg-transparent p-2 flex items-center justify-between cursor-pointer outline-none"
        >
          {/* left container */}
          <div className="flex items-center gap-3 shrink-0">
            <img src="/icons/lightning-fill.svg" alt="lightning" className="w-5 h-5" />
            <span className="text-white text-[14px] font-semibold leading-[1.32] tracking-[-0.005em]">
              Today's progress
            </span>
          </div>

          {/* right container */}
          <div className="flex items-center gap-2 flex-1 justify-end pl-4">
            <div className="w-full max-w-[100px] h-3 bg-white rounded-[4px] p-[1px] flex items-center overflow-hidden">
              <div 
                className="h-full bg-[#01FCC8] rounded-[2px] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-white shrink-0" />
            ) : (
              <ChevronUp className="w-5 h-5 text-white shrink-0" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

function TaskItem({ done, title }: { done: boolean; title: string }) {
  return (
    <div className="flex items-center gap-3 bg-white">
      <div 
        className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-colors duration-200 ${
          done ? "bg-[#01FCC8] border-[#01FCC8]" : "bg-white border-[#E2E3ED]"
        }`}
      />
      <span 
        className={`text-[14px] font-semibold leading-[1.32] tracking-[-0.005em] text-[#222631] transition-all duration-200 ${
          done ? "line-through text-opacity-70" : ""
        }`}
      >
        {title}
      </span>
    </div>
  );
}
