import {configureStore} from '@reduxjs/toolkit';
import favoritesReducer from './favoritesSlice';
import recipesReducer from './recipesSlice';


export const store = configureStore({
    reducer: {
        favorites: favoritesReducer,
        recipes: recipesReducer
    }
})

store.subscribe(() => {
    localStorage.setItem('favorites', JSON.stringify(store.getState().favorites));
    localStorage.setItem('myRecipes', JSON.stringify(store.getState().recipes));
});