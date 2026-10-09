import { Link } from "react-router";
import { Gamepad2, Instagram, Smile, X, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <div className="sh-footer-container">
      <footer className="sh-shell sh-footer">
        <div className="sh-footer-identity">
          <Link to="/" className="sh-footer-brand">
            TOOLKIT<span>+</span>
          </Link>
          <small>Plan · Study · Grow · Repeat</small>
        </div>
        <nav className="sh-footer-nav" aria-label="Footer">
          <Link to="/#overview">About</Link>
          <Link to="/#explore-tools">Features</Link>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </nav>
        <div className="sh-footer-social" aria-label="Social channels coming soon">
          <Gamepad2 size={16} aria-hidden="true" />
          <Instagram size={16} aria-hidden="true" />
          <X size={16} aria-hidden="true" />
          <Youtube size={17} aria-hidden="true" />
        </div>
        <div className="sh-footer-signoff">
          <span>
            Better Students
            <br />
            Brighter Tomorrow.
          </span>
          <Smile size={30} strokeWidth={2.4} aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
