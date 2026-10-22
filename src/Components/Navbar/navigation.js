import { BookOpen, BookOpenCheck, CalendarDays, Headphones, House, Timer, Wallet } from "lucide-react";

export const navigation = [
  { label: "Home", path: "/", icon: House },
  { label: "Schedule", path: "/schedule", icon: CalendarDays },
  { label: "Study Planner", path: "/study-planner", icon: BookOpen },
  { label: "Focus Mode", path: "/focus-mode", icon: Timer },
  { label: "Focus Study Mood", path: "/focus-study-mood", icon: Headphones },
  { label: "Quiz tracker", path: "/quiz-tracker", icon: BookOpenCheck },
  { label: "Budget", path: "/budget", icon: Wallet },
];
