import {useState, useEffect, useContext} from 'react'
import { useParams, useNavigate} from 'react-router-dom'
import { FavoritesContext } from '../context/FavoritesContext'
import { getMealById, extractIngredients } from "../api/mealApi"
import Loader from '../components/Loader'

function RecipeDetail () {
    const { isFavorite, toggleFavorite } = useContext(FavoritesContext) 

    const { id } = useParams()
    const navigate = useNavigate()

    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true)
            const data = await getMealById(id)
            setMeal(data)
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) return <Loader label='Loading recipe...' />

    if (!meal) {
        return (
            <div className="detail-missing">
                <style>{`.detail-missing { padding: 40px; text-align: center; }`}</style>
                <h2>Recipe not found 😒</h2>
                <button onClick={() => navigate('/browse')}>Back to Browse</button>
            </div>
        )
    }

    const ingredients = extractIngredients(meal)
    const favorited = isFavorite(meal.idMeal)
    const steps = meal.strInstructions
                    .split('\n')
                    .map((s) => s.trim())
                    .filter((s) => s.length >0)

    return (
        <div className="detail">
            <style>{`
                .detail { padding: 24px; }
                .detail .back-btn {
                background: none; border: none; color: #ef6c4d; cursor: pointer;
                font-size: 15px; font-weight: 600; padding: 0; margin-bottom: 16px;
                }
                .detail .detail-hero { display: flex; gap: 24px; flex-wrap: wrap; }
                .detail .detail-hero img { width: 320px; max-width: 100%; border-radius: 14px; object-fit: cover; }
                .detail .detail-meta h1 { margin: 0 0 6px; }
                .detail .tags { color: #616e7c; margin: 0 0 14px; }
                .detail .save-btn {
                padding: 10px 16px; border: 1px solid #ef6c4d; background: #fff; color: #ef6c4d;
                border-radius: 8px; cursor: pointer; font-weight: 700;
                }
                .detail .save-btn.active { background: #ef6c4d; color: #fff; }
                .detail .columns { display: grid; grid-template-columns: 1fr 2fr; gap: 28px; margin-top: 28px; }
                .detail .columns h2 { border-bottom: 2px solid #ffd166; padding-bottom: 6px; }
                .detail ul { padding-left: 18px; line-height: 1.8; }
                .detail .steps li { margin-bottom: 12px; line-height: 1.6; }
                .detail .yt { display: inline-block; margin-top: 10px; color: #ef6c4d; }
                @media (max-width: 720px) { .detail .columns { grid-template-columns: 1fr; } }
            `}</style>
            
            <button className='back-btn' onClick={() => navigate(-1)}>← Back</button>

            <div className='detail-hero'>
                <img src={meal.strMealThumb} alt={meal.strMeal}/>
                <div className='detail-meta'>
                    <h1>{meal.strMeal}</h1>
                    <p className='tags'>{meal.strCategory} • {meal.strArea}</p>
                    <button
                        className={favorited ? 'save-btn active' : 'save-btn' }
                        onClick={() => toggleFavorite(meal)}
                    >
                        {favorited ? '♥ Saved to Favorites' : '♡ Save to Favorites'}
                    </button>
                </div>
            </div>

            <div className='columns'>
                <div>
                    <h2>Ingredients</h2>
                    <ul>
                        {ingredients.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2>Instructions</h2>
                    <ol className='steps'>
                        {steps.map((step, i) => (
                            <li key={i}>{steps}</li>
                        ))}
                    </ol>
                </div>
            </div>

        </div>
    )
}

export default RecipeDetail