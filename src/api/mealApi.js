// src/api/mealApi.js
const BASE = 'https://www.themealdb.com/api/json/v1/1'

// Search meals by name. Returns an array (empty if none).
export async function searchMeals(query) {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`)
  const data = await res.json()
  return data.meals || []
}

// Get one full meal by its id. Returns the meal object or null.
export async function getMealById(id) {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`)
  const data = await res.json()
  return data.meals ? data.meals[0] : null
}

// Get the list of categories (Beef, Chicken, Dessert, ...).
export async function getCategories() {
  const res = await fetch(`${BASE}/categories.php`)
  const data = await res.json()
  return data.categories || []
}

// Get meals belonging to a category. Returns an array.
export async function getMealsByCategory(category) {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`)
  const data = await res.json()
  return data.meals || []
}

// Get one random meal.
export async function getRandomMeal() {
  const res = await fetch(`${BASE}/random.php`)
  const data = await res.json()
  return data.meals ? data.meals[0] : null
}

// TheMealDB stores ingredients as strIngredient1..20 + strMeasure1..20.
// This helper turns those into one clean array like ["200g Flour", "3 Eggs"].
export function extractIngredients(meal) {
  const list = []
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (name && name.trim()) {
      list.push(`${measure ? measure.trim() : ''} ${name.trim()}`.trim())
    }
  }
  return list
}