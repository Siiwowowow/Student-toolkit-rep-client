import { useEffect, useRef } from "react";
import { LogOut, ShieldCheck, X } from "lucide-react";
import "./FocusExitDialog.css";

export default function FocusExitDialog({ onStay, onLeave, error }) {
  const dialogRef = useRef(null);
  const stayRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    stayRef.current.focus({ preventScroll: true });
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={dialogRef} className="focus-exit-dialog" aria-labelledby="focus-exit-title" aria-describedby="focus-exit-description" onCancel={event => { event.preventDefault(); onStay(); }}>
    <button type="button" className="focus-exit-close" aria-label="Close warning and keep studying" onClick={onStay}><X size={20} /></button>
    <span className="focus-exit-icon"><ShieldCheck size={30} strokeWidth={1.7} /></span>
    <span className="focus-exit-eyebrow">PROTECT YOUR FOCUS</span>
    <h2 id="focus-exit-title">Ready to leave your study space?</h2>
    <p id="focus-exit-description">Leaving will end and reset your focus session. Both the study timer and wasted-time counter will stop. Your study history will stay saved.</p>
    <div className="focus-exit-note"><ShieldCheck size={18} /><span>You can move between Focus Mode and Focus Study Mood without ending your session.</span></div>
    {error && <p className="focus-exit-error" role="alert">{error}</p>}
    <div className="focus-exit-actions">
      <button ref={stayRef} type="button" className="focus-exit-stay" onClick={onStay}>Keep studying</button>
      <button type="button" className="focus-exit-leave" onClick={onLeave}><LogOut size={17} /> End session & leave</button>
    </div>
  </dialog>;
}
