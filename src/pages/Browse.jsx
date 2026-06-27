import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import { searchMeals, getMealsByCategory, getCategories } from '../api/mealApi'
import RecipeCard from '../components/RecipeCard'
import Loader from '../components/Loader'

function Browse() {

    const [searchParams, setSearchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''

    const [meals, setMeals] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState(query)

    // Load category list once.
    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    // Re-fetch whenever the URL's q or category changes.
    useEffect(() =>{
        async function load() {
            if(!query && !category) { setMeals([]); return}
            setLoading(true)
            let results = []
            if (category) {
                results = await getMealsByCategory(category)
            } else {
                results = await searchMeals(query)
            }
            setMeals(results)
            setLoading(false)
        }
        load()
    }, [query, category])

    function runSearch() {
        const q = input.trim()
        if (q) setSearchParams({ q })
    }

    function onCategoryChange(e) {
        const c = e.target.value
        if (c) setSearchParams({category: c})
        else setSearchParams({})
    }


    return (
        <div className="browse">
           <style>{`
                .browse { padding: 24px; }
                .browse .controls { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
                .browse input, .browse select {
                padding: 11px 13px; border: 1px solid #cbd2d9; border-radius: 9px; font-size: 15px;
                }
                .browse input { width: 280px; max-width: 90%; }
                .browse .search-btn {
                padding: 11px 16px; border: none; border-radius: 9px; background: #ef6c4d;
                color: #fff; font-weight: 700; cursor: pointer;
                }
                .browse .result-info { color: #616e7c; margin-bottom: 16px; }
                .browse .grid {
                display: grid; gap: 18px;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                }
                .browse .empty { text-align: center; padding: 60px 0; color: #616e7c; }
            `}</style>

            <h1>Browse Recipes</h1>

            <div className='controls'>
                <input 
                    type='text'
                    placeholder='Search by nme'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {if (e.key === 'Enter') runSearch()}}
                />
                <button className='search-btn' onClick={runSearch}>Search</button>

                <select value={category} onChange={onCategoryChange}>
                    <option value=''>All categories</option>
                    {categories.map((c) => (
                        <option key={c.idCategory} value={c.strCategory}>{c.strCategory}</option>
                    ))}
                </select>
            </div>
            {/* Tell the user what the URL currently says */}
            {category && <p className='result-info'>Showing Category: <strong>{category}</strong></p>}
            {!category && query && <p className='result-info'>Results for: <strong>{query}</strong></p>}

            {loading ? (
                <Loader label='Searching...' />
            ) : !query && !category ? (
                <div className='empty'>
                    <p>Type a dish name or pick from some category</p>
                </div>
            ) : meals.length === 0 ? (
                <div className='empty'>
                    <p>No recipes found. Try another search/</p>
                </div>
            ) : (
                <div className='grid'>
                    {meals.map((meal) => (
                        <RecipeCard 
                            key={meal.idMeal}
                            meal={meal}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Browse