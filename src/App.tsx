import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { AccountProvider } from "./context/AccountContext";
import { StageNavProvider } from "./context/StageNavContext";
import Home from "./pages/Home";
import { getHomePageData } from "./utils/contentStore";

const Practice = lazy(() => import("./pages/Practice"));
const CourseWizard = lazy(() => import("./pages/CourseWizard"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));

function RouteFallback() {
  return <div className="page-content panel"><div className="panel-body">Loading…</div></div>;
}

function BetaHomeRoute() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const enteredPassword = window.prompt("Enter admin password to browse beta books:", "");
    setAuthorized(enteredPassword === "admin123");
  }, []);

  if (authorized === null) {
    return <RouteFallback />;
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return <Home showUnpublishedOnly />;
}

function AppContent() {
  const homeData = getHomePageData();
  const style = homeData.style;
  const selectedTheme = style?.bookshelfTheme?.selectedTheme ?? "space";
  const heroTheme = style?.heroTheme?.selectedTheme ?? "space";
  const isCustomTheme = selectedTheme === "custom";

  const backgroundStyle = isCustomTheme
    ? (style?.main?.useGradient
        ? `linear-gradient(180deg, ${style.main.backgroundGradientStart} 0%, ${style.main.backgroundGradientEnd} 100%)`
        : (style?.main?.backgroundColor ?? "#f8fafc"))
    : undefined;

  // Set data attribute on body for theme CSS
  useEffect(() => {
    document.body.setAttribute('data-bookshelf-theme', selectedTheme);
    document.body.setAttribute('data-hero-theme', heroTheme);
    return () => {
      document.body.removeAttribute('data-bookshelf-theme');
      document.body.removeAttribute('data-hero-theme');
    };
  }, [selectedTheme, heroTheme]);

  return (
    <div 
      className="app-shell"
      style={{
        ...(backgroundStyle ? { background: backgroundStyle } : {}),
        color: style?.main?.color ?? "#0f172a",
        fontFamily: style?.main?.fontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      }}
    >
      <main className="app-main">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/beta_home" element={<BetaHomeRoute />} />
            <Route path="/home_test" element={<Navigate to="/beta_home" replace />} />
            <Route path="/beta_book" element={<Navigate to="/beta_home" replace />} />
            <Route path="/practice" element={<Navigate to="/" replace />} />
            <Route path="/practice/:categoryKey" element={<Practice />} />
            <Route path="/courses/:courseId" element={<CourseWizard />} />
            <Route path="/admin" element={<AdminAuth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <AccountProvider>
      <StageNavProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </StageNavProvider>
    </AccountProvider>
  );
}

export default App;
