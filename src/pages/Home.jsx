import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRandomMeal } from '../api/mealApi' 
import RecipeCard from '../components/RecipeCard'
import Loader from '../components/Loader'

function Home() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [featured, setFeatured] = useState([])
    const [loading, setLoading] = useState(true)

    // Load 4 random meals when the page first appers.
    useEffect(() => {
        async function loadFeatured() {
            const meals = []
            for(let i = 0; i < 4; i++) {
                const m = await getRandomMeal()
                if (m) meals.push(m)
            }
            setFeatured(meals)
            setLoading(false)
        }
        loadFeatured()
    }, [])

    // Pragrammatic Navigation: Send the typed query to the Browse page via querystrings in URL.
    function handleSearch() {
        const q = query.trim()
        if (q) navigate(`/browse?q=${encodeURIComponent(q)}`)
    }

    async function handleSurprise() {
        const meal = await getRandomMeal()
        if (meal) navigate(`/recipe/${meal.idMeal}`)
    }

    return (
        <div className='home'>
            <style>{`
                .home { padding: 24px; }
                .home .hero { text-align: center; padding: 36px 16px 24px; }
                .home .hero h1 { font-size: 34px; margin: 0 0 8px; }
                .home .hero p { color: #616e7c; margin: 0 0 22px; }
                .home .search-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
                .home .search-row input {
                width: 320px; max-width: 90%; padding: 12px 14px; border-radius: 10px;
                border: 1px solid #cbd2d9; font-size: 15px;
                }
                .home .btn {
                padding: 12px 18px; border: none; border-radius: 10px; cursor: pointer;
                font-weight: 700; font-size: 15px;
                }
                .home .btn.primary { background: #ef6c4d; color: #fff; }
                .home .btn.ghost { background: #fff; color: #1f2933; border: 1px solid #cbd2d9; }
                .home .section-title { margin: 36px 0 16px; }
                .home .grid {
                display: grid; gap: 18px;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                }
            `}</style>

            <div className='hero'>
                <h1>Find your next favorite meal 🍱</h1>
                <p>Search thousands of recipes, save the ones you love.</p>
                <div className='search-row'>
                    <input
                        type='text'
                        placeholder='Try Pasta, chicken....'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {if (e.key === 'Enter') handleSearch()}}
                    />
                    <button className='btn primary' onClick={handleSearch}>Search</button>
                    <button className='btn ghost' onClick={handleSurprise}>Surprise</button>
                </div>
            </div>

            <h2 className='section-title'>Featured right now</h2>
            {
                loading ? (
                    <Loader label='Plating up some ideas...' />
                ) : (
                    <div className='grid'>
                        {featured.map((meal) => (
                            <RecipeCard key={meal.idMeal} meal={meal}/>
                        ))}
                    </div>
                )
            }
        </div>
    )
}

export default Home