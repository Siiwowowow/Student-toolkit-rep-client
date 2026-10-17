import { BookOpen, BookOpenCheck, CalendarDays, House, Wallet } from "lucide-react";

export const navigation = [
  { label: "Home", path: "/", icon: House },
  { label: "Schedule", path: "/schedule", icon: CalendarDays },
  { label: "Study Planner", path: "/study-planner", icon: BookOpen },
  { label: "Budget", path: "/budget", icon: Wallet },
  { label: "Quiz tracker", path: "/quiz-tracker", icon: BookOpenCheck },
];
