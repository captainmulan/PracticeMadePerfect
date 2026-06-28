import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { StageNavProvider, useStageNav } from "./context/StageNavContext";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import CourseWizard from "./pages/CourseWizard";
import Admin from "./pages/Admin";

function AppHeader() {
  const { stageNav } = useStageNav();

  return (
    <header className={`app-header${stageNav ? " has-stage-nav" : ""}`}>
      <div className={`app-header-inner${stageNav ? " has-stage-nav" : ""}`}>
        <div className="app-brand">
          <div className="app-logo">M</div>
          <div>
            <p className="page-tag">မှော်ဝင် စာကြည့်တိုက်</p>
          </div>
        </div>

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

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Home
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <div className="app-shell">
      <StageNavProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </StageNavProvider>
    </div>
  );
}

export default App;
