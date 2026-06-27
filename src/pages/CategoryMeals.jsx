import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMealsByCategory } from '../api/mealApi'
import RecipeCard from '../components/RecipeCard'
import Loader from '../components/Loader'

function CategoriesMeals() {

    const {categoryName } = useParams()
    const [meals, setMeals] = useState([])
    const [loading, setLoading] =  useState(true)

    useEffect(() => {
        setLoading(true)
        getMealsByCategory(categoryName).then((data) => {
            setMeals(data)
            setLoading(false)
        })
    }, [categoryName])

    return (
        <div className="category-meals">
            <style>{`
                .category-meals .grid {
                display: grid; gap: 18px;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                }
            `}</style>
            <div className='grid'>
                {meals.map((meal) => (
                    <RecipeCard key={meal.idMeal} meal={meal} />
                ))}
            </div>
        </div>
    )
}

export default CategoriesMeals