import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Practice from "./pages/Practice";

function App() {
  return (
    <div className="app-shell">
      <BrowserRouter>
        <header className="app-header">
          <div className="app-brand">
            <div className="app-logo">PMP</div>
            <div>
              <p className="page-tag">PracticeMadePerfect</p>
              <h1 className="page-title">Interview practice built for busy schedules</h1>
            </div>
          </div>

          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Home
            </NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<Navigate to="/" replace />} />
            <Route path="/practice/:categoryKey" element={<Practice />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
