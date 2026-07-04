import {createSlice} from '@reduxjs/toolkit'

function getInitial() {
    try{
        const saved = localStorage.getItem('myRecipes');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading saved recipes:', error);
        return [];
    }
}

const recipesSlice = createSlice({
    name: 'recipes',
    initialState: getInitial(),
    reducers: {
        addRecipe(state, action) {
            const recipe = action.payload;
            state.push(recipe);
        },
        deleteRecipe(state, action) {
            const id = action.payload;
            return state.filter((recipe) => recipe.id !== id);
        }
    }
})

export const { addRecipe, deleteRecipe } = recipesSlice.actions

export default recipesSlice.reducer