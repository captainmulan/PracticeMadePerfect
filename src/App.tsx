import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { StageNavProvider } from "./context/StageNavContext";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import CourseWizard from "./pages/CourseWizard";
import AdminAuth from "./pages/AdminAuth";
import { getHomePageData } from "./utils/contentStore";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Navigate to="/" replace />} />
          <Route path="/practice/:categoryKey" element={<Practice />} />
          <Route path="/courses/:courseId" element={<CourseWizard />} />
          <Route path="/admin" element={<AdminAuth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <StageNavProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StageNavProvider>
  );
}

export default App;
