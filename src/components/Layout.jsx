// src/components/Layout.jsx
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import { useTheme } from '../context/ThemeContext'

function Layout() {
  const { theme } = useTheme()
  return (
    <div className={theme === 'dark' ? 'app dark' : 'app'}>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; }
        body {
          font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }
        .app { min-height: 100vh; display: flex; flex-direction: column; background: #f5f7fa; color: #1f2933; }
        .app-main { flex: 1; max-width: 1100px; width: 100%; margin: 0 auto; }

        /* 🌙 Dark theme — toggled by the global theme state in App */
        .app.dark { background: #11161c; color: #e4e7eb; }
        .app.dark .recipe-card { background: #1c232b; }
        .app.dark .browse input, .app.dark .browse select,
        .app.dark .home input { background: #1c232b; color: #e4e7eb; border-color: #3e4c59; }
      `}</style>

      <ScrollToTop />
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout