// src/components/Navbar.jsx
import { Link, NavLink } from 'react-router-dom'
// import { useFavorites } from '../context/FavoritesContext'
import { useFavorites } from '../hooks/useFavorites'
import { useTheme } from '../context/ThemeContext'

// 😖 Navbar finally USES the props that App drilled down through Layout.
function Navbar() {
  const { favorites } = useFavorites()
  const {theme, toggleTheme} = useTheme()

  function linkClass({ isActive }) {
    return isActive ? 'nav-link active' : 'nav-link'
  }

  return (
    <nav className="navbar">
      <style>{`
        .navbar {
          display: flex; align-items: center; gap: 20px;
          padding: 14px 24px; background: #1f2933; color: #fff;
        }
        .navbar .brand {
          font-size: 20px; font-weight: 700; color: #ffd166;
          text-decoration: none; margin-right: auto;
        }
        .navbar .nav-link {
          color: #e4e7eb; text-decoration: none; font-weight: 500;
          padding-bottom: 2px; border-bottom: 2px solid transparent;
        }
        .navbar .nav-link:hover { color: #ffd166; }
        .navbar .nav-link.active { color: #ffd166; border-bottom-color: #ffd166; }
        .navbar .count {
          background: #ef6c4d; color: #fff; border-radius: 999px;
          padding: 1px 8px; font-size: 12px; margin-left: 4px;
        }
        .navbar .theme-btn {
          background: none; border: 1px solid #52606d; color: #fff;
          border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 15px;
        }
      `}</style>

      <Link to="/" className="brand">🍴 Tasty</Link>
      <NavLink to="/" end className={linkClass}>Home</NavLink>
      <NavLink to="/browse" className={linkClass}>Browse</NavLink>
      <NavLink to="/categories" className={linkClass}>Categories</NavLink>
      <NavLink to="/favorites" className={linkClass}>
        Favorites <span className="count">{favorites.length}</span>
      </NavLink>
      <NavLink to="/my-recipes" className={linkClass}>
        My Recipes
      </NavLink>
      <NavLink to="/add-recipe" className={linkClass}>
        Add Recipe
      </NavLink>

      <button className="theme-btn" onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </nav>
  )
}

export default Navbar