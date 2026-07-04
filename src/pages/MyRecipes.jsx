import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { deleteRecipe } from '../store/recipesSlice.js'

function MyRecipes() {
  const recipes = useSelector((state) => state.recipes)
  const dispatch = useDispatch()

  return (
    <div className="my-recipes">
      <style>{`
        .my-recipes { padding: 24px; }
        .my-recipes .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
        .my-recipes .add-link { background: #ef6c4d; color: #fff; padding: 9px 14px; border-radius: 9px; text-decoration: none; font-weight: 700; }
        .my-recipes .empty { text-align: center; padding: 60px 0; color: #616e7c; }
        .my-recipes .empty a { color: #ef6c4d; font-weight: 700; }
        .my-recipes .recipe-list { display: flex; flex-direction: column; gap: 20px; }
        .my-recipes .my-card { display: flex; gap: 18px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .my-recipes .my-card img { width: 180px; height: 180px; object-fit: cover; flex-shrink: 0; }
        .my-recipes .my-card .body { padding: 14px 16px; flex: 1; }
        .my-recipes .my-card h2 { margin: 0 0 4px; }
        .my-recipes .my-card .meta { color: #616e7c; margin: 0 0 10px; font-size: 14px; }
        .my-recipes .my-card h3 { margin: 8px 0 4px; font-size: 14px; }
        .my-recipes .my-card ul { margin: 0 0 8px; padding-left: 18px; }
        .my-recipes .my-card .instructions { white-space: pre-wrap; line-height: 1.5; margin: 0; }
        .my-recipes .delete-btn { margin-top: 10px; background: #fff; border: 1px solid #cf1124; color: #cf1124; border-radius: 8px; padding: 7px 12px; cursor: pointer; font-weight: 600; }
        @media (max-width: 620px) { .my-recipes .my-card { flex-direction: column; } .my-recipes .my-card img { width: 100%; height: 200px; } }
      `}</style>

      <div className="head">
        <h1>My Recipes ({recipes.length})</h1>
        <Link to="/add-recipe" className="add-link">+ Add a recipe</Link>
      </div>

      {recipes.length === 0 ? (
        <div className="empty">
          <p>You haven't added any recipes yet. <Link to="/add-recipe">Create your first →</Link></p>
        </div>
      ) : (
        <div className="recipe-list">
          {recipes.map((r) => (
            <article className="my-card" key={r.id}>
              <img src={r.image} alt={r.title} />
              <div className="body">
                <h2>{r.title} {r.vegetarian && '🌱'}</h2>
                <p className="meta">{r.category} · {r.area} · {r.difficulty}</p>
                <h3>Ingredients</h3>
                <ul>{r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                <h3>Instructions</h3>
                <p className="instructions">{r.instructions}</p>
                <button className="delete-btn" onClick={() => dispatch(deleteRecipe(r.id))}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyRecipes