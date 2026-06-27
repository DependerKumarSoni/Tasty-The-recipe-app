// src/pages/Favorites.jsx
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { FavoritesContext } from '../context/FavoritesContext.jsx'
import RecipeCard from '../components/RecipeCard.jsx'

// 😖 Receives favorites + functions from App, then drills them into each RecipeCard.
function Favorites() {
  const {favorites, clearFavorites } = useContext(FavoritesContext)
  return (
    <div className="favorites">
      <style>{`
        .favorites { padding: 24px; }
        .favorites .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .favorites .clear-btn { padding: 8px 14px; border: 1px solid #cbd2d9; background: #fff; color: #1f2933; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .favorites .clear-btn:hover { border-color: #ef6c4d; color: #ef6c4d; }
        .favorites .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); margin-top: 18px; }
        .favorites .empty { text-align: center; padding: 60px 0; color: #616e7c; }
        .favorites .empty a { color: #ef6c4d; font-weight: 700; }
      `}</style>

      <div className="head">
        <h1>Your Favorites ({favorites.length})</h1>
        {favorites.length > 0 && (
          <button className="clear-btn" onClick={clearFavorites}>Clear all</button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty">
          <p>No favorites yet. <Link to="/browse">Find something tasty →</Link></p>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((meal) => (
            <RecipeCard
              key={meal.idMeal}
              meal={meal}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites