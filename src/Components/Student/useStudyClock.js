import { useSyncExternalStore } from "react";

let now = Date.now(), timer;
const subscribers = new Set();
const tick = () => { now = Date.now(); subscribers.forEach(notify => notify()); };
function subscribe(notify) {
  subscribers.add(notify);
  if (subscribers.size === 1) {
    tick(); timer = setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    subscribers.delete(notify);
    if (!subscribers.size) {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    }
  };
}
export default function useStudyClock() {
  return useSyncExternalStore(subscribe, () => now);
}
