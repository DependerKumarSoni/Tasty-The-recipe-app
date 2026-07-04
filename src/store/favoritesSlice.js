import {createSlice} from '@reduxjs/toolkit';

function getInitial() {
    try {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error reading favorites from localStorage:', error);
        return [];
    }
}


const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: getInitial(),
    reducers: {
        toggleFavorite(state, action) {
            const meal = action.payload;
            const i = state.findIndex((m) => m.idMeal === meal.idMeal);
            if (i >= 0) {
                // console.log('before splice:', meal);
                state.splice(i, 1);
                // console.log('after splice:', meal);
            } else {
                state.push({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb });
                // console.log('after push:', state);
            }
        },
        removeFavorite(state, action) {
            return state.filter((m) => m.idMeal !== action.payload);
        },
        clearFavorites() {
            return [];
        }
    }
});

export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer;