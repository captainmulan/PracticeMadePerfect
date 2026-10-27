import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState, type MouseEvent } from "react";
import type { LibraryAudience } from "../utils/libraryAudience";

type LibraryTopBarProps = {
  onHome?: () => void;
  onCategory?: () => void;
  onLogin?: () => void;
  showHomeMenu?: boolean;
  selectedAudience?: LibraryAudience | null;
  onAudienceChange?: (audience: LibraryAudience) => void;
};

export default function LibraryTopBar({ onHome, onCategory, onLogin, showHomeMenu = false, selectedAudience = null, onAudienceChange }: LibraryTopBarProps) {
  const location = useLocation();
  const isSearch = location.pathname === "/search";
  const [leavingHome, setLeavingHome] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const openHome = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onHome) return;
    event.preventDefault();
    setLeavingHome(true);
    window.setTimeout(() => {
      onHome();
      setLeavingHome(false);
    }, 80);
  };

  return (
    <header className="library-top-bar">
      {leavingHome && typeof document !== "undefined"
        ? createPortal(
            <div className="home-return-loader" role="status" aria-live="polite">
              <span className="home-return-loader-emoji" aria-hidden="true">📚</span>
              <span>Opening your library</span>
              <span className="home-return-loader-dots" aria-hidden="true">...</span>
            </div>,
            document.body,
          )
        : null}
      <div className="library-top-bar-start">
        {showHomeMenu ? <div className="library-menu-wrap">
          <button
            type="button"
            className="library-menu-trigger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div className="library-menu-panel" role="menu" aria-label="More options">
              {["Login", "Settings", "About"].map((item) => (
                <button
                  key={item}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowComingSoon(true);
                    setMenuOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div> : null}
      <Link className="library-top-bar-brand" to="/" onClick={openHome} aria-label="Magic Library home">
        <span className="library-top-bar-mark" aria-hidden="true">✦</span>
        <span>Magic Library</span>
      </Link>
      </div>
      <nav className="library-top-bar-nav" aria-label="Library navigation">
        {onCategory ? (
          <button type="button" className="library-top-bar-link" onClick={onCategory}>
            Category
          </button>
        ) : (
          <Link className="library-top-bar-link" to="/?view=category">Category</Link>
        )}
        <Link className={`library-top-bar-link ${isSearch ? "active" : ""}`} to="/search" aria-current={isSearch ? "page" : undefined}>
          Search
        </Link>
        {showHomeMenu ? null : onLogin ? (
          <button type="button" className="library-top-bar-link library-top-bar-login" onClick={onLogin}>
            Login
          </button>
        ) : (
          <Link className="library-top-bar-link library-top-bar-login" to="/?view=login">Login</Link>
        )}
        {onAudienceChange ? (
          <div className="library-audience-switch" role="group" aria-label="Browse audience">
            {(["Other", "Kid"] as const).map((audience) => (
              <button
                key={audience}
                type="button"
                className={selectedAudience === audience ? "active" : ""}
                aria-pressed={selectedAudience === audience}
                onClick={() => onAudienceChange(audience)}
              >
                {audience}
              </button>
            ))}
          </div>
        ) : null}
      </nav>
      {showComingSoon && typeof document !== "undefined"
        ? createPortal(
            <div className="library-coming-soon" role="status" aria-live="polite">
              Coming Soon...
              <button type="button" aria-label="Dismiss message" onClick={() => setShowComingSoon(false)}>×</button>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}