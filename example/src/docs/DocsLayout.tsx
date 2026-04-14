import { useEffect } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import "./docs.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function DocsLayout() {
  return (
    <>
      <ScrollToTop />
      <header className="docs-header">
        <Link to="/" className="docs-header-title">
          react-<span>gameroom</span>
        </Link>
        <div className="docs-header-links">
          <a href="https://github.com/raphaelaleixo/react-gameroom" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/react-gameroom" target="_blank" rel="noopener noreferrer">
            npm
          </a>
          <Link to="/play" className="docs-demo-link">
            Try Demo
          </Link>
        </div>
      </header>
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <nav className="docs-sidebar-nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/guide">Guide</NavLink>
            <NavLink to="/api">API Reference</NavLink>
            <NavLink to="/examples">Examples</NavLink>
          </nav>
        </aside>
        <main className="docs-content">
          <div className="docs-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
