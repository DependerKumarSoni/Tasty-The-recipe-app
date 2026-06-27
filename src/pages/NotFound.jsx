// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="not-found">
      <style>{`
        .not-found { padding: 60px 24px; text-align: center; }
        .not-found h1 { font-size: 72px; margin: 0; color: #ef6c4d; }
        .not-found h2 { margin: 8px 0 16px; }
        .not-found a { color: #ef6c4d; font-weight: 700; }
      `}</style>
      <h1>404</h1>
      <h2>Page not found</h2>
      <p><Link to="/">← Back to Home</Link></p>
    </div>
  )
}

export default NotFound
