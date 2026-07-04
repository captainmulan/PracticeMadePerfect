import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StageNavProvider } from "./context/StageNavContext";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import CourseWizard from "./pages/CourseWizard";
import Admin from "./pages/Admin";
import { getHomePageData } from "./utils/contentStore";

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
