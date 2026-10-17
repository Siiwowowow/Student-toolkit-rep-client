import { useEffect, useRef } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Search, X } from "lucide-react";

export function PageHeading({ eyebrow, title, description, children }) {
  return <header className="adm-page-heading"><div><span className="adm-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><div className="adm-heading-actions">{children}</div></header>;
}
export function DataState({ loading, error, reload }) {
  if (loading) return <div className="adm-empty" role="status"><span className="loading loading-spinner" />Loading workspace...</div>;
  if (error) return <div className="adm-empty" role="alert"><AlertCircle size={32} /><h2>Could not load this section</h2><p>{error}</p><button className="adm-button" type="button" onClick={reload}><RefreshCw size={16} />Try again</button></div>;
  return null;
}
export function Pagination({ page, pages, total, onPage }) {
  return <div className="adm-pagination"><span>{total} {total === 1 ? "item" : "items"} / Page {page + 1} of {Math.max(1, pages)}</span><div><button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)}><ChevronLeft size={17} /></button><button type="button" aria-label="Next page" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={17} /></button></div></div>;
}
export function SearchForm({ value, onChange, onSubmit, placeholder = "Search...", children }) {
  return <form className="adm-filters" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><label className="adm-search"><Search size={18} /><input aria-label={placeholder} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={100} /></label>{children}<button className="adm-button adm-button-secondary" type="submit">Search</button></form>;
}
export function ConfirmDialog({ title, description, confirmLabel = "Remove", busy, onConfirm, onClose }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="adm-dialog" aria-labelledby="adm-confirm-title" aria-describedby="adm-confirm-description" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}><div className="adm-dialog-head"><span className="adm-danger-icon"><AlertCircle size={24} /></span><button className="adm-icon-button" type="button" aria-label="Close confirmation" disabled={busy} onClick={onClose}><X size={20} /></button></div><h2 id="adm-confirm-title">{title}</h2><p id="adm-confirm-description">{description}</p><div className="adm-dialog-actions"><button type="button" className="adm-button adm-button-secondary" disabled={busy} onClick={onClose} autoFocus>Cancel</button><button type="button" className="adm-button adm-button-danger" disabled={busy} onClick={onConfirm}>{busy ? "Removing..." : confirmLabel}</button></div></dialog>;
}
