import { BrowserRouter, NavLink, Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { StageNavProvider, useStageNav } from "./context/StageNavContext";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import CourseWizard from "./pages/CourseWizard";
import Admin from "./pages/Admin";
import { getHomePageData } from "./utils/contentStore";

function AppHeader() {
  const { stageNav } = useStageNav();
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";
  const homeData = getHomePageData();
  const style = homeData.style;

  return (
    <header 
      className={`app-header${stageNav ? " has-stage-nav" : ""}`}
      style={{
        background: style?.topMenu?.useBackgroundColorGradient 
          ? `linear-gradient(180deg, ${style.topMenu.backgroundColorGradientStart} 0%, ${style.topMenu.backgroundColorGradientEnd} 100%)` 
          : (style?.topMenu?.backgroundColor ?? "rgba(255, 255, 255, 0.96)"),
        color: style?.topMenu?.color ?? "#0f172a",
        borderBottomColor: style?.topMenu?.borderBottomColor ?? "#e2e8f0"
      }}
    >
      <div className={`app-header-inner${stageNav ? " has-stage-nav" : ""}`}>
        <Link to="/" className="app-brand">
          <div 
            className="app-logo"
            style={{
              background: style?.topMenu?.useLogoBackgroundColorGradient 
                ? `linear-gradient(180deg, ${style.topMenu.logoBackgroundColorGradientStart} 0%, ${style.topMenu.logoBackgroundColorGradientEnd} 100%)` 
                : (style?.topMenu?.logoBackgroundColor ?? "#0f172a"),
              color: style?.topMenu?.logoColor ?? "#ffffff"
            }}
          >M</div>
          <div>
            <p className="page-tag"></p>
          </div>
        </Link>

        {stageNav ? (
          <div className="app-stage-nav" aria-label="Step navigation">
            <button
              type="button"
              className="app-stage-nav-button"
              onClick={stageNav.onPrevious}
              disabled={!stageNav.canPrevious}
              aria-label="Previous step"
            >
              &lt;
            </button>
            <span className="app-stage-nav-label">
              {stageNav.current} / {stageNav.total}
            </span>
            <button
              type="button"
              className="app-stage-nav-button"
              onClick={stageNav.onNext}
              disabled={!stageNav.canNext}
              aria-label="Next step"
            >
              &gt;
            </button>
          </div>
        ) : null}

        {!isAdminPage && (
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              style={({ isActive }) => ({
                background: isActive 
                  ? (style?.tabs?.useActiveBackgroundColorGradient 
                      ? `linear-gradient(180deg, ${style.tabs.activeBackgroundColorGradientStart} 0%, ${style.tabs.activeBackgroundColorGradientEnd} 100%)` 
                      : (style?.tabs?.activeBackgroundColor ?? "#0f172a")) 
                  : (style?.tabs?.useBackgroundColorGradient 
                      ? `linear-gradient(180deg, ${style.tabs.backgroundColorGradientStart} 0%, ${style.tabs.backgroundColorGradientEnd} 100%)` 
                      : (style?.tabs?.backgroundColor ?? "#e2e8f0")),
                color: isActive ? (style?.tabs?.activeColor ?? "#ffffff") : (style?.tabs?.color ?? "#334155"),
              })}
            >
              Home
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

function AppContent() {
  const homeData = getHomePageData();
  const style = homeData.style;

  return (
    <div 
      className="app-shell"
      style={{
        background: style?.main?.useGradient 
          ? `linear-gradient(180deg, ${style.main.backgroundGradientStart} 0%, ${style.main.backgroundGradientEnd} 100%)` 
          : (style?.main?.backgroundColor ?? "#f8fafc"),
        color: style?.main?.color ?? "#0f172a",
        fontFamily: style?.main?.fontFamily ?? "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      }}
    >
      <AppHeader />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Navigate to="/" replace />} />
          <Route path="/practice/:categoryKey" element={<Practice />} />
          <Route path="/courses/:courseId" element={<CourseWizard />} />
          <Route path="/admin" element={<Admin />} />
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
