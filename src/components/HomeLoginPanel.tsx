import { useState } from "react";
import type { Announcement } from "../types/announcement";
import { useAnnouncements } from "../utils/useAnnouncements";

type AuthMode = "login" | "register";

export default function HomeLoginPanel() {
  const { announcements, loaded, error } = useAnnouncements();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "register") {
      setMessage("Coming soon");
      return;
    }
    setMessage("Coming soon");
  };

  return (
    <div className="home-login-panel">
      <section className="home-login-section panel panel-bordered">
        <div className="home-login-section-header">
          <h2 className="home-login-section-title">Account</h2>
          <div className="home-login-mode-tabs">
            <button
              type="button"
              className={`home-login-mode-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`home-login-mode-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>
        </div>

        <form className="home-login-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label className="home-login-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}
          <label className="home-login-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete={mode === "register" ? "email" : "username"}
            />
          </label>
          <label className="home-login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </label>
          {message && <p className="home-login-message">{message}</p>}
          <button type="submit" className="home-login-submit">
            {mode === "register" ? "Register" : "Login"}
          </button>
        </form>
      </section>

      <section className="home-announcements panel panel-bordered">
        <div className="home-login-section-header">
          <h2 className="home-login-section-title">Announcements</h2>
        </div>
        {!loaded ? (
          <p className="home-announcements-empty">Loading announcements...</p>
        ) : error ? (
          <p className="home-announcements-empty">Could not load announcements.</p>
        ) : announcements.length === 0 ? (
          <p className="home-announcements-empty">No announcements yet.</p>
        ) : (
          <ul className="home-announcements-list">
            {announcements.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const publishedLabel = new Date(item.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li className="home-announcement-card">
      <div className="home-announcement-card-header">
        <h3 className="home-announcement-title">{item.title}</h3>
        <time className="home-announcement-date" dateTime={item.publishedAt}>
          {publishedLabel}
        </time>
      </div>
      <p className="home-announcement-body">{item.body}</p>
    </li>
  );
}
