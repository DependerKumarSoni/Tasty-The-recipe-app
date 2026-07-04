import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addRecipe } from '../store/recipesSlice.js'

const CATEGORIES = ['Beef', 'Chicken', 'Dessert', 'Pasta', 'Seafood', 'Vegetarian', 'Breakfast', 'Side', 'Miscellaneous']

const EMPTY_FORM = {
  title: '',
  category: 'Pasta',
  area: '',
  image: '',
  vegetarian: false,
  difficulty: 'Easy',
  instructions: '',
}

function AddRecipe() {
  // 1️⃣ One state object holds every simple field.
  const [form, setForm] = useState(EMPTY_FORM)
  // Ingredients are a dynamic LIST, each with a stable id (see idea 4).
  const [ingredients, setIngredients] = useState([{ id: crypto.randomUUID(), value: '' }])
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const titleRef = useRef(null)   // 5️⃣ a handle to the title input (for focus)

  // useRef gives us a direct handle to a DOM node. Focus the title on mount.
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // 2️⃣ ONE change handler for text / select / checkbox, keyed by the input's `name`.
  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // 4️⃣ Dynamic ingredient rows: update / add / remove by id.
  function updateIngredient(id, value) {
    setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, value } : ing)))
  }
  function addIngredientRow() {
    setIngredients((prev) => [...prev, { id: crypto.randomUUID(), value: '' }])
  }
  function removeIngredientRow(id) {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }

  // 3️⃣ Validation: returns an object of { field: message }. Empty = valid.
  function validate() {
    const next = {}
    if (form.title.trim().length < 3) next.title = 'Title must be at least 3 characters.'
    const filled = ingredients.map((i) => i.value.trim()).filter(Boolean)
    if (filled.length === 0) next.ingredients = 'Add at least one ingredient.'
    if (form.instructions.trim().length < 10) next.instructions = 'Instructions must be at least 10 characters.'
    return next
  }

  function handleSubmit(e) {
    e.preventDefault()                       // ⛔ stop the browser's full-page reload
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return   // invalid → show errors, don't submit

    const newRecipe = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      category: form.category,
      area: form.area.trim() || 'Unknown',
      image: form.image.trim() || 'https://placehold.co/400x300?text=My+Recipe',
      vegetarian: form.vegetarian,
      difficulty: form.difficulty,
      ingredients: ingredients.map((i) => i.value.trim()).filter(Boolean),
      instructions: form.instructions.trim(),
    }

    dispatch(addRecipe(newRecipe))   // 🎯 into the Redux store
    navigate('/my-recipes')          // 🎯 programmatic nav after success
  }

  return (
    <div className="add-recipe">
      <style>{`
        .add-recipe { padding: 24px; max-width: 720px; }
        .add-recipe h1 { margin-bottom: 18px; }
        .recipe-form { display: flex; flex-direction: column; gap: 18px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field > span { font-weight: 600; font-size: 14px; }
        .field input, .field select, .field textarea {
          padding: 10px 12px; border: 1px solid #cbd2d9; border-radius: 9px; font-size: 15px; font-family: inherit;
        }
        .field input:focus, .field select:focus, .field textarea:focus { outline: 2px solid #ef6c4d; border-color: #ef6c4d; }
        .checkbox-field { display: flex; align-items: center; gap: 8px; }
        .radio-field { border: 1px solid #e4e7eb; border-radius: 9px; padding: 8px 12px; }
        .radio-field legend { font-weight: 600; font-size: 14px; padding: 0 6px; }
        .radio-field label { display: inline-flex; align-items: center; gap: 4px; margin-right: 14px; font-size: 14px; }
        .ingredient-row { display: flex; gap: 8px; margin-bottom: 8px; }
        .ingredient-row input { flex: 1; }
        .row-remove { border: 1px solid #cbd2d9; background: #fff; border-radius: 8px; padding: 0 12px; cursor: pointer; }
        .row-add { align-self: flex-start; background: none; border: 1px dashed #ef6c4d; color: #ef6c4d; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 600; }
        .err { color: #cf1124; font-size: 13px; }
        .submit-btn { background: #ef6c4d; color: #fff; border: none; border-radius: 10px; padding: 13px; font-weight: 700; font-size: 16px; cursor: pointer; }
        .state-peek { background: #f5f7fa; border-radius: 8px; padding: 10px 12px; font-size: 13px; }
        .state-peek pre { overflow-x: auto; margin: 8px 0 0; }
      `}</style>

      <h1>Add Your Own Recipe</h1>

      {/* noValidate turns OFF the browser's built-in validation so OUR messages show */}
      <form className="recipe-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Title *</span>
          <input
            ref={titleRef}
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Grandma's Chicken Curry"
          />
          {errors.title && <span className="err">{errors.title}</span>}
        </label>

        <label className="field">
          <span>Category</span>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="field">
          <span>Cuisine / Area</span>
          <input name="area" value={form.area} onChange={handleChange} placeholder="Indian" />
        </label>

        <label className="field">
          <span>Image URL</span>
          <input name="image" value={form.image} onChange={handleChange} placeholder="https://…" />
        </label>

        <label className="checkbox-field">
          <input type="checkbox" name="vegetarian" checked={form.vegetarian} onChange={handleChange} />
          <span>Vegetarian 🌱</span>
        </label>

        <fieldset className="radio-field">
          <legend>Difficulty</legend>
          {['Easy', 'Medium', 'Hard'].map((level) => (
            <label key={level}>
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={form.difficulty === level}
                onChange={handleChange}
              />
              {level}
            </label>
          ))}
        </fieldset>

        <div className="field">
          <span>Ingredients *</span>
          {ingredients.map((ing, index) => (
            <div className="ingredient-row" key={ing.id}>
              <input
                value={ing.value}
                onChange={(e) => updateIngredient(ing.id, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
              {ingredients.length > 1 && (
                <button type="button" className="row-remove" onClick={() => removeIngredientRow(ing.id)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="row-add" onClick={addIngredientRow}>+ Add ingredient</button>
          {errors.ingredients && <span className="err">{errors.ingredients}</span>}
        </div>

        <label className="field">
          <span>Instructions *</span>
          <textarea
            name="instructions"
            rows="5"
            value={form.instructions}
            onChange={handleChange}
            placeholder="Step-by-step method…"
          />
          {errors.instructions && <span className="err">{errors.instructions}</span>}
        </label>

        {/* Teaching aid: watch the form state update live as you type */}
        <details className="state-peek">
          <summary>Peek at the live form state (teaching aid)</summary>
          <pre>{JSON.stringify({ ...form, ingredients }, null, 2)}</pre>
        </details>

        <button type="submit" className="submit-btn">Save Recipe</button>
      </form>
    </div>
  )
}

export default AddRecipe