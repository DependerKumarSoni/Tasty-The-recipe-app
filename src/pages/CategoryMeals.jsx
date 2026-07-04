import { useParams } from 'react-router-dom'
import { getMealsByCategory } from '../api/mealApi'
import { useFetch } from '../hooks/useFetch'
import RecipeCard from '../components/RecipeCard'
import Loader from '../components/Loader'

function CategoriesMeals() {

    const { categoryName } = useParams()

    // One line replaces useState(meals) + useState(loading) + useEffect. ✨
    const { data: meals, loading } = useFetch(
        () => getMealsByCategory(categoryName),
        [categoryName]
    )

    if (loading) return <Loader label={`Loading ${categoryName}…`} />

    return (
        <div className="category-meals">
            <style>{`
                .category-meals .grid {
                display: grid; gap: 18px;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                }
            `}</style>
            <div className='grid'>
                {(meals || []).map((meal) => (
                    <RecipeCard key={meal.idMeal} meal={meal} />
                ))}
            </div>
        </div>
    )
}

export default CategoriesMeals
