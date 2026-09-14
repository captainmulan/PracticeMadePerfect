import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState, type MouseEvent } from "react";

type LibraryTopBarProps = {
  onHome?: () => void;
  onCategory?: () => void;
  onLogin?: () => void;
};

export default function LibraryTopBar({ onHome, onCategory, onLogin }: LibraryTopBarProps) {
  const location = useLocation();
  const isSearch = location.pathname === "/search";
  const [leavingHome, setLeavingHome] = useState(false);

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
      <Link className="library-top-bar-brand" to="/" onClick={openHome} aria-label="Magic Library home">
        <span className="library-top-bar-mark" aria-hidden="true">✦</span>
        <span>Magic Library</span>
      </Link>
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
        {onLogin ? (
          <button type="button" className="library-top-bar-link library-top-bar-login" onClick={onLogin}>
            Login
          </button>
        ) : (
          <Link className="library-top-bar-link library-top-bar-login" to="/?view=login">Login</Link>
        )}
      </nav>
    </header>
  );
}