import { useSelector, useDispatch } from 'react-redux'
import { 
    toggleFavorite as toggleFavoriteAction, 
    removeFavorite as removeFavoriteAction,
    clearFavorites as clearFavoritesAction 
} from '../store/favoritesSlice'

export function useFavorites() {
    const favorites = useSelector((state) => state.favorites)
    const dispatch = useDispatch()

    return {
        favorites,
        isFavorite: (id) => favorites.some((m) => m.idMeal === id),
        toggleFavorite: (meal) => dispatch(toggleFavoriteAction(meal)),
        removeFavorite: (id) => dispatch(removeFavoriteAction(id)),
        clearFavorites: () => dispatch(clearFavoritesAction())
    }
}