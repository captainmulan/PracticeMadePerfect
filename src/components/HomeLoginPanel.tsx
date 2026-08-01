import { useState } from "react";
import type { Announcement } from "../types/announcement";
import { useAccount } from "../context/AccountContext";
import { useAnnouncements } from "../utils/useAnnouncements";

type AuthMode = "login" | "register";

export default function HomeLoginPanel() {
  const { announcements, loaded, error } = useAnnouncements();
  const {
    user,
    initializing,
    authBackend,
    supportsGoogle,
    paymentsEnabled,
    entitlement,
    signInWithEmail,
    registerWithEmail,
    signInWithGoogle,
    signOut,
    startCheckout,
  } = useAccount();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      if (mode === "register") {
        await registerWithEmail({ email, password, displayName: name });
        setMessage("Account created. You’re signed in.");
      } else {
        await signInWithEmail({ email, password });
        setMessage("Signed in.");
      }
      setPassword("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setMessage("");
    setBusy(true);
    try {
      await signInWithGoogle();
      setMessage("Signed in with Google.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = async () => {
    setMessage("");
    setBusy(true);
    try {
      const result = await startCheckout();
      if (result.status === "unavailable") {
        setMessage(result.message);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="home-login-panel">
      <section className="home-login-section panel panel-bordered">
        <div className="home-login-section-header">
          <h2 className="home-login-section-title">Account</h2>
          {!user && (
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
          )}
        </div>

        {initializing ? (
          <p className="home-login-message">Checking session…</p>
        ) : user ? (
          <div className="home-login-form">
            <p className="home-login-signed-in">
              Signed in as <strong>{user.displayName || user.email || user.userId}</strong>
            </p>
            <p className="home-login-backend-hint">
              Plan: {entitlement?.plan ?? "free"}
              {entitlement?.stripeCustomerId ? " · Stripe linked" : ""}
            </p>
            {paymentsEnabled && (
              <button
                type="button"
                className="home-login-submit"
                disabled={busy}
                onClick={() => void handleCheckout()}
              >
                Upgrade / Checkout
              </button>
            )}
            <button
              type="button"
              className="home-login-secondary"
              disabled={busy}
              onClick={() => void signOut()}
            >
              Sign out
            </button>
            {message && <p className="home-login-message">{message}</p>}
          </div>
        ) : (
          <form className="home-login-form" onSubmit={(event) => void handleSubmit(event)}>
            {supportsGoogle && (
              <>
                <button
                  type="button"
                  className="home-login-google"
                  disabled={busy}
                  onClick={() => void handleGoogle()}
                >
                  {busy ? "Please wait…" : "Continue with Google"}
                </button>
                <p className="home-login-divider">or use email</p>
              </>
            )}
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
                required
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
                required
                minLength={6}
              />
            </label>
            {message && <p className="home-login-message">{message}</p>}
            <button type="submit" className="home-login-submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "register" ? "Register" : "Login"}
            </button>
            {authBackend === "local" && (
              <p className="home-login-backend-hint">
                Local accounts on this device. Cloud Google sign-in activates after Firebase Auth is enabled.
              </p>
            )}
          </form>
        )}
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
