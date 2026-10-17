import { NavLink } from "react-router";
import { navigation } from "./navigation";
import "./MobileBottomNav.css";

export default function MobileBottomNav() {
  return (
    <nav className="sh-bottom-nav" aria-label="Mobile bottom navigation">
      {navigation.map(({ label, path, icon }) => {
        const Icon = icon;
        return (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `sh-bottom-link${isActive ? " sh-bottom-active" : ""}`
            }
          >
            <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
