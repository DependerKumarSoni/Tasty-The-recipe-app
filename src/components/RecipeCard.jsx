import { memo } from 'react'
import { Link } from 'react-router-dom'
// import { useFavorites } from '../context/FavoritesContext'
import { useFavorites } from '../hooks/useFavorites'

function RecipeCard({ meal }) {
    console.log('🔥🔥RecipeCard rendered:', meal.strMeal);
    const {isFavorite, toggleFavorite } = useFavorites()
    const canFavorite = typeof toggleFavorite === 'function'
    const favorited = canFavorite && isFavorite(meal.idMeal)
    return (
        <div className='recipe-card'>
            <style>{`
                .recipe-card {
                background: #fff; border-radius: 12px; overflow: hidden;
                box-shadow: 0 1px 4px rgba(0,0,0,0.08);
                display: flex; flex-direction: column;
                transition: transform 0.15s, box-shadow 0.15s;
                max-width: 340px;
                }
                .recipe-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
                .recipe-card .card-link { text-decoration: none; color: inherit; }
                .recipe-card .card-img { width: 100%; height: 160px; object-fit: cover; display: block; }
                .recipe-card .card-title { font-size: 15px; font-weight: 600; padding: 12px 12px 8px; margin: 0; }
                .recipe-card .fav-btn {
                margin: 0 12px 12px; padding: 8px 10px; border: 1px solid #ef6c4d;
                background: #fff; color: #ef6c4d; border-radius: 8px; cursor: pointer; font-weight: 600;
                }
                .recipe-card .fav-btn.active { background: #ef6c4d; color: #fff; }
            `}</style>

            <Link to={`/recipe/${meal.idMeal}`} className="card-link">
                <img className='card-img' src={meal.strMealThumb} alt={meal.strMeal} />
                <h3 className='card-title'>{meal.strMeal}</h3>
            </Link>

            {canFavorite && (
                <button
                    className={favorited ? 'fav-btn active' : 'fav-btn'}
                    onClick={() => toggleFavorite(meal)}
                >
                    {favorited ? '♥ Saved': '♡ Save'}
                </button>
            )}
        </div>
    )
}

export default memo(RecipeCard)