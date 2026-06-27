import { createContext, useContext, useEffect, useReducer } from "react";

export const FavoritesContext = createContext();

function getIntialFavorites() {
    try {
        const saved = localStorage.getItem('favorites')
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

// The Reducer: the single place that describes EVERY Favorite transition.
// RULE: it must RETURN A NEW ARRAY - never mutate a state directly.
function favoritesReducer(state, action) {
    switch(action.type) {
        case 'TOGGLE': {
            const meal = action.payload
            const exists = state.some((m) => m.idMeal === meal.idMeal)
            if (exists) {
                return state.filter((m) => m.idMeal !== meal.idMeal)
            }
            return [...state, {
                idMeal: meal.idMeal,
                strMeal: meal.strMeal,
                strMealThumb: meal.strMealThumb
            }]
        }
        case 'REMOVE':
            return state.filter((m) => m.idMeal !== action.payload)
        case 'CLEAR':
            return []
        default:
            return state // unknown action -> state unchanged.
    }
}

export function FavoritesProvider({ children }) {
    const [favorites, dispatch] = useReducer(favoritesReducer, undefined, getIntialFavorites)

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }, [favorites])

    function toggleFavorite(meal) {
        dispatch({
            type: 'TOGGLE',
            payload: meal
        })
    }

    function removeFavorite(id) {
        dispatch({
            type: 'REMOVE',
            payload: id
        })
    }

    function clearFavorites() {
        dispatch({type: 'CLEAR'})
    }

    function isFavorite(id) {
        return favorites.some((m) => m.idMeal === id)
    }

    const value = {favorites, toggleFavorite, isFavorite, removeFavorite, clearFavorites}
    
    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext)
    if(ctx === undefined) {
        throw new Error('useFavorite must be used inside a <FavoritesProvider>')
    }
    return ctx
}