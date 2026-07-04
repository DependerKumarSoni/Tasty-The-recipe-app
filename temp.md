# Phase 5 — State Management, Performance, Forms & SSR (Context · useReducer · Custom Hooks · Redux · React.memo/useMemo/useCallback · Forms · SSR Intro)
### A step-by-step continuation that extends the same "Tasty" recipe app from the React Router guide

> **For the instructor.** This guide picks up exactly where the React Router project ended — with `favorites` and `theme` owned in `App.jsx` and **prop-drilled** everywhere, each marked `// 🔮 FUTURE: moves to Redux`. Phase 5 walks in and deletes that pain on camera. Same house style as before: story first, *why* before *how*, verbatim teaching scripts, on-the-board diagrams, **complete** file contents (no `...`), an integration step + checkpoint after every change, a Common Mistakes section, a recap table, and homework.
>
> **Prerequisite:** the finished Tasty app from the React Router guide (Vite + `react-router-dom`, the `pages/` and `components/` you already built). We will *edit* that project, not start over.
>
> **What students know coming in:** components, props, routing, and a light touch of `useState`/`useEffect`. We now make state management the main event.
>
> **House rules unchanged:** all CSS lives in `<style>{`…`}</style>` tags with semantic class names — no inline `style={{}}`, no external CSS files.

### Suggested pacing

This guide spans more than one sitting. It's organized into **sessions** you can split wherever your class time falls:

- **Session A** (Parts 0–3, ≈2h10m): the prop-drilling pain → Context/`useContext` → `useReducer` → custom hooks.
- **Session B** (Parts 4–6, ≈2h10m): Redux Toolkit → performance patterns (`React.memo`/`useMemo`/`useCallback`) → **Forms**.
- **Session C** (Parts 7–8, ≈55m): an SSR intro → recap/homework. (Fold into Session B if you have the time.)

> 📌 **If you're resuming here** (i.e. you already taught Parts 0–3 last class): start today directly at **Part 4**. Everything below assumes the Tasty app already has `ThemeContext`/`FavoritesContext`, the `useReducer`-based favorites logic, and the `useLocalStorage`/`useFetch` custom hooks in place from last time.

| Block | Topic | Time |
|---|---|---|
| Part 0 | Recap the prop-drilling pain | 10 min |
| Part 1 | Context API (deep dive) + `useContext` | 45 min |
| Part 2 | `useReducer` | 35 min |
| Part 3 | Custom hooks | 40 min |
| Part 4 | Redux Toolkit (introduction + migration) | 30 min |
| Part 5 | `React.memo` / `useMemo` / `useCallback` (performance patterns) | 50 min |
| Part 6 | **Forms in React** (controlled inputs, validation, submit → Redux) | 50 min |
| Part 7 | Server-Side Rendering — concepts + a minimal demo | 40 min |
| Part 8 | Recap, mistakes, homework | 15 min |

---

## PART 0 — Remember the Pain (≈10 min, no code)

> 🎤 **Opening script:** *"Last time we shipped a working router app, but it had a smell. To share one tiny list of favorites, we threaded the same data through five different paths and made middlemen carry props they never used. We literally wrote `// 🔮 FUTURE: moves to Redux` next to it. Today is that future. We're going to delete every one of those prop chains — and by the end you'll have hand-built the core idea behind Redux, then met the real thing."*

Put last week's maze back on the board:

```
   THE PROP-DRILLING MAZE (today we demolish it)
   =============================================
                       App  (owns favorites + theme)
                        │   passes props down every branch
     ┌───────────┬──────┴─────┬─────────────┬───────────┐
   Layout      Browse     RecipeDetail   Favorites   Categories
     │           │                          │           │
   Navbar    RecipeCard                 RecipeCard   CategoryMeals
 (needs count                                        ❌ couldn't even
  + theme)                                              get favorites!
```

> 🎤 *"Two specific crimes to remember: (1) `Layout` accepts `theme` only to hand it to `Navbar` — a courier, not a user. (2) `CategoryMeals` lives behind an `<Outlet/>`, so App couldn't hand it favorites at all — that's why those cards had no Save button. Watch both crimes get solved in the next 45 minutes."*

> 🎨 **The fix in one sentence (write it big):**
> ```
>   PROP DRILLING = passing data DOWN through every level.
>   CONTEXT       = putting data in the AIR so any level can grab it directly.
> ```

---

## PART 1 — Context API (deep dive) + `useContext` (≈45 min)

### 1.1 The "why"

> 🎤 **Script:** *"React's normal data flow is top-down: parent → child via props. That's great until many far-apart components need the SAME thing. The Context API gives us a way to put a value 'in the air' at the top of the tree and let ANY component below reach up and read it — skipping all the middlemen. Three pieces: you **create** a context, a **Provider** broadcasts a value into the tree, and **`useContext`** lets a component tune in."*

> 🎨 **Board diagram — the radio analogy:**
> ```
>   createContext()  →  builds a RADIO STATION (an empty channel)
>   <Provider value={...}>  →  the BROADCAST TOWER (puts data on the air
>                              for everything inside it)
>   useContext(Channel)  →  a RADIO RECEIVER in any component
>                           (tunes in, gets the current value, no props)
>
>        <FavoritesProvider>           ← broadcasts favorites
>            └─ everything in here can useContext(FavoritesContext)
>               Navbar ◄─ RecipeCard ◄─ Favorites ◄─ CategoryMeals
>               (all tune in DIRECTLY — no drilling)
> ```

> 🎤 **Analogy to say out loud:** *"Prop drilling is handing a note person-to-person down a line until it reaches the back. Context is the overhead announcement — everyone in the room hears it at once, no passing required."*

### 1.2 Create the Theme context (the simplest one first)

We'll make a `context/` folder. Start with theme because it's just one value + one toggle.

**Create `src/context/ThemeContext.jsx`:**

```jsx
// src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from 'react'

// 1️⃣ Create the channel. We export it so components can tune in with useContext.
export const ThemeContext = createContext()

// 2️⃣ The Provider OWNS the state and broadcasts it to everything inside it.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  // persist theme across refreshes
  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  // 3️⃣ Whatever we put in `value` is what consumers receive.
  const value = { theme, toggleTheme }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
```

> 🎤 **Walk through the three numbered lines.** *"`createContext()` makes the channel. `ThemeProvider` is a component whose only job is to hold the theme state and broadcast it via `value`. `{children}` is whatever we wrap with this provider — our whole app. Notice the state that used to live in `App` now lives HERE, close to the feature it belongs to."*

### 1.3 Create the Favorites context (same pattern, more data)

**Create `src/context/FavoritesContext.jsx`:**

```jsx
// src/context/FavoritesContext.jsx
import { createContext, useState, useEffect } from 'react'

export const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  function toggleFavorite(meal) {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.idMeal === meal.idMeal)
      if (exists) return prev.filter((m) => m.idMeal !== meal.idMeal)
      return [...prev, {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
      }]
    })
  }

  function isFavorite(id) {
    return favorites.some((m) => m.idMeal === id)
  }

  const value = { favorites, toggleFavorite, isFavorite }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
```

> 🎤 *"This is the SAME logic that lived in App last week — `favorites`, `toggleFavorite`, `isFavorite`, plus the localStorage effect — just relocated into its own provider. We didn't invent new logic; we moved it to where it belongs."*

### 1.4 Integration step — wrap the app in both Providers

A provider only broadcasts to components **inside** it, so we wrap the whole app. Open `src/main.jsx` and wrap `<App />` with both providers (inside `BrowserRouter`).

**Replace `src/main.jsx` entirely with:**

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

> 🎤 **Why nest them?** *"Each provider wraps everything inside it. Order between sibling providers doesn't matter here since they're independent. Together they put theme AND favorites 'in the air' for the entire app."*

### 1.5 Integration step — gut `App.jsx` (the satisfying part)

`App` no longer owns favorites or theme, so it stops passing props. **Watch how much disappears.**

**Replace `src/App.jsx` entirely with:**

```jsx
// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import RecipeDetail from './pages/RecipeDetail.jsx'
import Categories from './pages/Categories.jsx'
import CategoriesIndex from './pages/CategoriesIndex.jsx'
import CategoryMeals from './pages/CategoryMeals.jsx'
import Favorites from './pages/Favorites.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  // 🎉 No state here anymore. No favorites, no theme, no toggle functions.
  // 🎉 No props passed to ANY route. App is back to being just a router.
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="recipe/:id" element={<RecipeDetail />} />
        <Route path="categories" element={<Categories />}>
          <Route index element={<CategoriesIndex />} />
          <Route path=":categoryName" element={<CategoryMeals />} />
        </Route>
        <Route path="favorites" element={<Favorites />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
```

> 🎤 **Hold this up next to last week's App.** *"Last week this file was bloated with state, three functions, two localStorage effects, and props on every single `<Route>`. Now it's pure routing. The 🔮 FUTURE comments are gone because the future is now. THIS is what good state management buys you: each concern lives where it belongs."*


### 1.6 Integration step — make components tune in with `useContext`

Now every component that needs theme or favorites reads it **directly** from context instead of via props. Let's update them one by one.

**(a) `src/components/Layout.jsx`** — reads `theme` from context, passes nothing to Navbar. Replace the file with:

```jsx
// src/components/Layout.jsx
import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext.jsx'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'

function Layout() {
  const { theme } = useContext(ThemeContext)   // 👈 tune in — no props needed

  return (
    <div className={theme === 'dark' ? 'app dark' : 'app'}>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
        .app { min-height: 100vh; display: flex; flex-direction: column; background: #f5f7fa; color: #1f2933; }
        .app-main { flex: 1; max-width: 1100px; width: 100%; margin: 0 auto; }
        .app.dark { background: #11161c; color: #e4e7eb; }
        .app.dark .recipe-card { background: #1c232b; }
        .app.dark .browse input, .app.dark .browse select, .app.dark .home input {
          background: #1c232b; color: #e4e7eb; border-color: #3e4c59;
        }
      `}</style>

      <ScrollToTop />
      <Navbar />                {/* 👈 NO props — Navbar tunes in itself */}
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
```

> 🎤 **Crime #1 solved.** *"`Layout` no longer carries `favoritesCount` and `toggleTheme` just to pass them on. It reads only the `theme` it actually uses, and hands Navbar nothing. The courier is unemployed."*

**(b) `src/components/Navbar.jsx`** — reads favorites count + theme from context. Replace the file with:

```jsx
// src/components/Navbar.jsx
import { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FavoritesContext } from '../context/FavoritesContext.jsx'
import { ThemeContext } from '../context/ThemeContext.jsx'

function Navbar() {
  const { favorites } = useContext(FavoritesContext)     // 👈 tune in
  const { theme, toggleTheme } = useContext(ThemeContext) // 👈 tune in

  function linkClass({ isActive }) {
    return isActive ? 'nav-link active' : 'nav-link'
  }

  return (
    <nav className="navbar">
      <style>{`
        .navbar { display: flex; align-items: center; gap: 20px; padding: 14px 24px; background: #1f2933; color: #fff; }
        .navbar .brand { font-size: 20px; font-weight: 700; color: #ffd166; text-decoration: none; margin-right: auto; }
        .navbar .nav-link { color: #e4e7eb; text-decoration: none; font-weight: 500; padding-bottom: 2px; border-bottom: 2px solid transparent; }
        .navbar .nav-link:hover { color: #ffd166; }
        .navbar .nav-link.active { color: #ffd166; border-bottom-color: #ffd166; }
        .navbar .count { background: #ef6c4d; color: #fff; border-radius: 999px; padding: 1px 8px; font-size: 12px; margin-left: 4px; }
        .navbar .theme-btn { background: none; border: 1px solid #52606d; color: #fff; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 15px; }
      `}</style>

      <Link to="/" className="brand">🍴 Tasty</Link>
      <NavLink to="/" end className={linkClass}>Home</NavLink>
      <NavLink to="/browse" className={linkClass}>Browse</NavLink>
      <NavLink to="/categories" className={linkClass}>Categories</NavLink>
      <NavLink to="/favorites" className={linkClass}>
        Favorites <span className="count">{favorites.length}</span>
      </NavLink>

      <button className="theme-btn" onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </nav>
  )
}

export default Navbar
```

**(c) `src/components/RecipeCard.jsx`** — every card now self-serves favorites from context, so it only needs the `meal` prop. Replace the file with:

```jsx
// src/components/RecipeCard.jsx
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { FavoritesContext } from '../context/FavoritesContext.jsx'

// Only prop now: `meal`. Favorites come from context, so ANY card anywhere
// in the app gets a working Save button automatically. 🎉
function RecipeCard({ meal }) {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext)
  const favorited = isFavorite(meal.idMeal)

  return (
    <div className="recipe-card">
      <style>{`
        .recipe-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); display: flex; flex-direction: column; transition: transform 0.15s, box-shadow 0.15s; }
        .recipe-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
        .recipe-card .card-link { text-decoration: none; color: inherit; }
        .recipe-card .card-img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .recipe-card .card-title { font-size: 15px; font-weight: 600; padding: 12px 12px 8px; margin: 0; }
        .recipe-card .fav-btn { margin: 0 12px 12px; padding: 8px 10px; border: 1px solid #ef6c4d; background: #fff; color: #ef6c4d; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .recipe-card .fav-btn.active { background: #ef6c4d; color: #fff; }
      `}</style>

      <Link to={`/recipe/${meal.idMeal}`} className="card-link">
        <img className="card-img" src={meal.strMealThumb} alt={meal.strMeal} />
        <h3 className="card-title">{meal.strMeal}</h3>
      </Link>

      <button
        className={favorited ? 'fav-btn active' : 'fav-btn'}
        onClick={() => toggleFavorite(meal)}
      >
        {favorited ? '♥ Saved' : '♡ Save'}
      </button>
    </div>
  )
}

export default RecipeCard
```

**(d) `src/pages/RecipeDetail.jsx`** — reads favorites from context. **Change only the imports and the top of the component**; everything below stays the same as your router-guide version.

Change the import line for hooks/router to add `useContext` and the context, and remove the `{ isFavorite, toggleFavorite }` props:

```jsx
// at the top of src/pages/RecipeDetail.jsx
import { useState, useEffect, useContext } from 'react'           // 👈 add useContext
import { useParams, useNavigate } from 'react-router-dom'
import { FavoritesContext } from '../context/FavoritesContext.jsx' // 👈 add
import { getMealById, extractIngredients } from '../api/mealApi.js'
import Loader from '../components/Loader.jsx'

// 👇 remove the props — pull from context instead
function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext)  // 👈 add
  // ...the rest of the file is UNCHANGED...
```

**(e) `src/pages/Browse.jsx`** — Browse no longer needs favorites at all (the cards self-serve). Change just the function signature and the card render:

```jsx
// change the signature from:  function Browse({ isFavorite, toggleFavorite }) {
// to:
function Browse() {
```

…and where it renders cards, drop the favorite props:

```jsx
        <RecipeCard key={meal.idMeal} meal={meal} />
```

**(f) `src/pages/Favorites.jsx`** — reads the favorites list from context. Replace the file with:

```jsx
// src/pages/Favorites.jsx
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { FavoritesContext } from '../context/FavoritesContext.jsx'
import RecipeCard from '../components/RecipeCard.jsx'

function Favorites() {
  const { favorites } = useContext(FavoritesContext)   // 👈 tune in

  return (
    <div className="favorites">
      <style>{`
        .favorites { padding: 24px; }
        .favorites .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        .favorites .empty { text-align: center; padding: 60px 0; color: #616e7c; }
        .favorites .empty a { color: #ef6c4d; font-weight: 700; }
      `}</style>

      <h1>Your Favorites</h1>

      {favorites.length === 0 ? (
        <div className="empty">
          <p>No favorites yet. <Link to="/browse">Find something tasty →</Link></p>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((meal) => (
            <RecipeCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
```

**(g) `src/pages/CategoryMeals.jsx`** — the big payoff. These cards are behind the `<Outlet/>`, but with context they get Save buttons for **free**. Just make sure the card render has no fav props (it already only passes `meal`):

```jsx
        {/* Crime #2 solved: these cards now have working Save buttons,
            even though App never passed favorites down to them. */}
        {meals.map((meal) => (
          <RecipeCard key={meal.idMeal} meal={meal} />
        ))}
```

> 🎤 **Crime #2 solved — make a big deal of this.** *"Last week we literally could NOT put a Save button on category cards because they sit behind an `<Outlet/>` and App couldn't reach them. We didn't change `CategoryMeals` logic at all — yet now its cards can favorite, because `RecipeCard` reaches UP into context on its own. That impossibility just became automatic. THAT is the power of Context."*

> ✅ **CHECKPOINT 1 (everything still works, zero drilling):** Run the app. Save a recipe from Browse → navbar count updates. Open it in detail → shows "♥ Saved." Go to **Categories → Seafood** → those cards now have working Save buttons. Refresh the browser → favorites + theme persist. Toggle 🌙 Dark → whole app darkens. **And `App.jsx` passes not a single prop.** Same behavior, none of the pain.

### 1.7 One honest nuance: the re-render gotcha (≈4 min)

> 🎤 **Script (say it, don't over-drill it):** *"Context has one catch worth knowing: when a provider's `value` changes, EVERY component reading that context re-renders. That's why we used TWO separate contexts — changing favorites shouldn't re-render theme-only components, and vice versa. Splitting by concern keeps re-renders tight. There's also a subtle one: we build a fresh `value = {...}` object every render, so the provider hands out a 'new' value each time. In big apps you'd wrap it in `useMemo` (a hook that caches a value between renders) to avoid waking up consumers needlessly. For an app this size it's fine — but you should know the lever exists. Redux, later, solves this with fine-grained selectors."*


---

## PART 2 — `useReducer`: organizing complex state logic (≈35 min)

### 2.1 The "why"

> 🎤 **Script:** *"Our favorites logic is getting busier. Right now it's one `toggleFavorite`, but real apps need add, remove, clear-all, maybe more. With `useState` you end up with several functions each calling `setFavorites` with its own little update — the logic scatters. `useReducer` collects ALL the ways state can change into ONE function — the reducer — and components just **dispatch** an action describing what happened. Bonus: this is the EXACT mental model Redux uses, so you're previewing it for free."*

> 🎨 **Board diagram — useState vs useReducer:**
> ```
>   useState (logic scattered):
>     toggleFavorite → setFavorites(...)
>     removeFavorite → setFavorites(...)
>     clearFavorites → setFavorites([])
>          (three places that all know how favorites change)
>
>   useReducer (logic centralized):
>     component → dispatch({ type: 'TOGGLE', payload: meal })
>                        │
>                        ▼
>     reducer(state, action) → returns the NEW state
>        switch (action.type) { case 'TOGGLE': ...  case 'REMOVE': ... }
>          (ONE place that knows every transition)
> ```

> 🎤 **Analogy:** *"`useState` is like everyone in the office editing the shared document directly. `useReducer` is a single clerk: you hand them a slip ('TOGGLE this meal') and only the clerk edits the record. One source of truth for *how* changes happen."*

### 2.2 Rewrite FavoritesContext to use a reducer

We keep the same Context wrapper — we just swap its internals from `useState` to `useReducer`, and add `remove` and `clear` while we're here.

**Replace `src/context/FavoritesContext.jsx` entirely with:**

```jsx
// src/context/FavoritesContext.jsx
import { createContext, useReducer, useEffect } from 'react'

export const FavoritesContext = createContext()

// Read the starting value from localStorage (runs once).
function getInitialFavorites() {
  try {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// 🧠 THE REDUCER: the single place that describes EVERY favorites transition.
// Rule: it must RETURN A NEW array — never mutate `state` directly.
function favoritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      const meal = action.payload
      const exists = state.some((m) => m.idMeal === meal.idMeal)
      if (exists) {
        return state.filter((m) => m.idMeal !== meal.idMeal)
      }
      return [...state, {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
      }]
    }
    case 'REMOVE':
      return state.filter((m) => m.idMeal !== action.payload)
    case 'CLEAR':
      return []
    default:
      return state   // unknown action → state unchanged
  }
}

export function FavoritesProvider({ children }) {
  // useReducer(reducer, initialArg, initFn) — the 3rd arg lazily computes the
  // initial state once, so we don't read localStorage on every render.
  const [favorites, dispatch] = useReducer(favoritesReducer, undefined, getInitialFavorites)

  // Persist on every change (same as before).
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // Friendly "action creators" so components never build raw action objects.
  function toggleFavorite(meal) { dispatch({ type: 'TOGGLE', payload: meal }) }
  function removeFavorite(id)   { dispatch({ type: 'REMOVE', payload: id }) }
  function clearFavorites()     { dispatch({ type: 'CLEAR' }) }
  function isFavorite(id)       { return favorites.some((m) => m.idMeal === id) }

  const value = { favorites, toggleFavorite, removeFavorite, clearFavorites, isFavorite }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
```

> 🎤 **Three things to call out:**
> 1. *"The reducer is a pure function: `(state, action) => newState`. Same inputs, same output, no side effects. It just computes the next array."*
> 2. *"**Never mutate `state`** in a hand-written reducer — always return a new array (`[...state]`, `.filter`, etc.). React decides 'did it change?' by checking if it's a NEW reference. (Heads-up: Redux Toolkit later lets you 'mutate' safely — but that's a special trick we'll explain. Plain `useReducer` does not.)"*
> 3. *"Components don't know action types. They call `toggleFavorite(meal)`; the provider turns that into `dispatch({ type: 'TOGGLE', payload: meal })`. Clean public API, centralized logic."*

> 🗒️ **Note:** the **consumer components don't change at all.** `toggleFavorite` and `isFavorite` still exist on the context value with the same signatures. We refactored the *inside* of the provider; the outside contract is identical. That's good design.

### 2.3 Integration step — add a "Clear all" button to exercise the new action

Let's use `clearFavorites` so the reducer's value is visible. Open `src/pages/Favorites.jsx` and update it to pull `clearFavorites` and show a button when there are favorites.

**Replace `src/pages/Favorites.jsx` entirely with:**

```jsx
// src/pages/Favorites.jsx
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { FavoritesContext } from '../context/FavoritesContext.jsx'
import RecipeCard from '../components/RecipeCard.jsx'

function Favorites() {
  const { favorites, clearFavorites } = useContext(FavoritesContext)

  return (
    <div className="favorites">
      <style>{`
        .favorites { padding: 24px; }
        .favorites .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .favorites .clear-btn { padding: 8px 14px; border: 1px solid #cbd2d9; background: #fff; color: #1f2933; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .favorites .clear-btn:hover { border-color: #ef6c4d; color: #ef6c4d; }
        .favorites .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); margin-top: 18px; }
        .favorites .empty { text-align: center; padding: 60px 0; color: #616e7c; }
        .favorites .empty a { color: #ef6c4d; font-weight: 700; }
      `}</style>

      <div className="head">
        <h1>Your Favorites ({favorites.length})</h1>
        {favorites.length > 0 && (
          <button className="clear-btn" onClick={clearFavorites}>Clear all</button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty">
          <p>No favorites yet. <Link to="/browse">Find something tasty →</Link></p>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((meal) => (
            <RecipeCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
```

> ✅ **CHECKPOINT 2:** Favorites still toggle everywhere exactly as before (proving the refactor was invisible to consumers). The Favorites page now shows a **Clear all** button that empties the list and updates the navbar count instantly — all routed through the one reducer. Refresh → still persisted.

> 🎤 **Plant the Redux seed (say this — it sets up Part 4):** *"Pause and look at what we have: a single reducer, actions with a `type` and `payload`, a `dispatch`, and 'action creator' functions. Tattoo those words on your brain. In about 40 minutes you'll see Redux, and it is literally these same four things with a library wrapped around them."*


---

## PART 3 — Custom Hooks: packaging logic for reuse (≈40 min)

### 3.1 The "why"

> 🎤 **Script:** *"Look at the repetition piling up. Two contexts both do the same localStorage dance. Every component that reads context writes the same two import lines plus `useContext(...)`. Every page that fetches data repeats `useState` + `useState(loading)` + `useEffect`. A **custom hook** is just a function whose name starts with `use` that calls other hooks. It lets us extract that repeated logic ONCE and reuse it everywhere — cleaner components, fewer bugs, one place to fix."*

> 🎨 **Board diagram:**
> ```
>   A custom hook = a reusable recipe of hook calls.
>   ================================================
>   Rule: name starts with "use", and it may call useState/useEffect/useContext/etc.
>
>   useLocalStorage(key, init)  → state that auto-syncs to localStorage
>   useFavorites()              → clean, guarded access to FavoritesContext
>   useTheme()                  → clean, guarded access to ThemeContext
>   useFetch(fn, deps)          → data + loading + error for any async call
> ```

We'll build four, smallest first.

### 3.2 `useLocalStorage` — state that persists itself

**Create `src/hooks/useLocalStorage.js`:**

```js
// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react'

// Works just like useState, but mirrors the value to localStorage.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue   // corrupt/old data → fall back safely
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]   // same shape as useState
}
```

**Refactor `src/context/ThemeContext.jsx` to use it** — watch the boilerplate vanish. Replace the file with:

```jsx
// src/context/ThemeContext.jsx
import { createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // One line replaces useState + useEffect + manual localStorage. ✨
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  const value = { theme, toggleTheme }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
```

> 🎤 *"The localStorage logic didn't disappear — it MOVED into a reusable hook. Now any component or context can persist state with one line, and if we ever need to fix the persistence (say, handle quota errors), there's exactly ONE place to do it."*

### 3.3 `useFavorites` and `useTheme` — clean, guarded context access

> 🎤 **Script:** *"Every consumer writes two imports and `useContext(SomeContext)`. Worse, if someone forgets to wrap the app in the provider, they get a confusing `undefined`. We'll wrap each context read in a custom hook that (a) is shorter to call and (b) throws a clear error if used outside its provider. We co-locate the hook with its context."*

**Add `useFavorites` to `src/context/FavoritesContext.jsx`** — add `useContext` to the import and export this hook at the bottom:

```jsx
// at the TOP of src/context/FavoritesContext.jsx, update the import:
import { createContext, useReducer, useEffect, useContext } from 'react'

// ...keep getInitialFavorites, favoritesReducer, and FavoritesProvider exactly as in Part 2...

// 👇 ADD this custom hook at the BOTTOM of the file:
export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (ctx === undefined) {
    throw new Error('useFavorites must be used inside a <FavoritesProvider>')
  }
  return ctx
}
```

**Add `useTheme` to `src/context/ThemeContext.jsx`** — update the import and append the hook:

```jsx
// update the top import of src/context/ThemeContext.jsx:
import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// ...keep ThemeContext + ThemeProvider as in 3.2...

// 👇 ADD at the bottom:
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (ctx === undefined) {
    throw new Error('useTheme must be used inside a <ThemeProvider>')
  }
  return ctx
}
```

**Now refactor consumers to the clean hooks.** Each change is tiny — swap the `useContext` import/call for the new hook:

- **`src/components/Navbar.jsx`** — replace the two context imports + the two `useContext` lines with:
  ```jsx
  import { useFavorites } from '../context/FavoritesContext.jsx'
  import { useTheme } from '../context/ThemeContext.jsx'
  // ...inside Navbar():
  const { favorites } = useFavorites()
  const { theme, toggleTheme } = useTheme()
  ```
  (Remove `import { useContext } from 'react'` if nothing else uses it.)

- **`src/components/Layout.jsx`**:
  ```jsx
  import { useTheme } from '../context/ThemeContext.jsx'
  // ...inside Layout():
  const { theme } = useTheme()
  ```

- **`src/components/RecipeCard.jsx`**:
  ```jsx
  import { useFavorites } from '../context/FavoritesContext.jsx'
  // ...inside RecipeCard():
  const { isFavorite, toggleFavorite } = useFavorites()
  ```

- **`src/pages/RecipeDetail.jsx`**:
  ```jsx
  import { useFavorites } from '../context/FavoritesContext.jsx'
  // ...inside RecipeDetail():
  const { isFavorite, toggleFavorite } = useFavorites()
  ```

- **`src/pages/Favorites.jsx`**:
  ```jsx
  import { useFavorites } from '../context/FavoritesContext.jsx'
  // ...inside Favorites():
  const { favorites, clearFavorites } = useFavorites()
  ```

> 🎤 *"Read a component now: `const { favorites } = useFavorites()`. It reads like English, it can't be used wrong without a loud error, and no component imports the raw context anymore. That's the polish a custom hook buys."*

### 3.4 `useFetch` — kill the fetch/loading boilerplate

> 🎤 **Script:** *"Every data page repeats the same three-state ritual: a state for data, a state for loading, a `useEffect` to fetch. Let's extract it into `useFetch`. We'll even fix a real bug along the way: if a user switches categories quickly, an old slow response can overwrite a newer one. Our hook ignores stale responses."*

**Create `src/hooks/useFetch.js`:**

```js
// src/hooks/useFetch.js
import { useState, useEffect } from 'react'

// Runs `asyncFn` (which returns a promise) and tracks data/loading/error.
// `deps` controls when it re-runs (like useEffect's dependency array).
export function useFetch(asyncFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true        // guards against stale responses
    setLoading(true)
    setError(null)

    asyncFn()
      .then((result) => { if (active) setData(result) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }   // cleanup: ignore this call's result if deps changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
```

**Refactor `src/pages/CategoryMeals.jsx` to use it.** Replace the file with:

```jsx
// src/pages/CategoryMeals.jsx
import { useParams } from 'react-router-dom'
import { getMealsByCategory } from '../api/mealApi.js'
import { useFetch } from '../hooks/useFetch.js'
import RecipeCard from '../components/RecipeCard.jsx'
import Loader from '../components/Loader.jsx'

function CategoryMeals() {
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
        .category-meals .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
      `}</style>
      <div className="grid">
        {(meals || []).map((meal) => (
          <RecipeCard key={meal.idMeal} meal={meal} />
        ))}
      </div>
    </div>
  )
}

export default CategoryMeals
```

> 🗒️ **Optional (great as a live exercise):** refactor `RecipeDetail.jsx` the same way — `const { data: meal, loading } = useFetch(() => getMealById(id), [id])` — then delete its `useState`/`useEffect`. Leave `Home` and `Browse` as homework.

> ✅ **CHECKPOINT 3:** The app behaves identically, but the code is dramatically cleaner: persistence lives in `useLocalStorage`, context access in `useFavorites`/`useTheme`, and fetching in `useFetch`. Switch categories rapidly — no flicker of stale results (the `active` guard working). Try temporarily rendering `<RecipeCard>` *outside* the provider tree and you'll get the friendly `useFavorites must be used inside a <FavoritesProvider>` error instead of a cryptic crash.

---

## PART 4 — Redux Toolkit: the introduction (and a real migration) (≈40 min)

> 📌 **Today's class starts here.** Quick verbal recap before you type anything: *"Last class we killed prop drilling with Context, centralized favorites logic with `useReducer`, and packaged it all into custom hooks — `useLocalStorage`, `useFavorites`, `useTheme`, `useFetch`. Today: meet Redux (the library version of the reducer you already wrote), then: keeping the app fast (`React.memo`/`useMemo`/`useCallback`), handling **forms**, and (time permitting) rendering on the server (SSR)."*

### 4.1 The big reveal: you already built mini-Redux

> 🎤 **Script (deliver this slowly):** *"Before we install anything — look at what you wrote today. A reducer. Actions with a `type` and `payload`. A `dispatch`. Action-creator functions. A provider broadcasting a store of state. A custom hook to read it. Congratulations: you hand-built the core of Redux. The library just formalizes and supercharges these exact pieces — and because you understand them from the inside, Redux will feel familiar, not foreign."*

> 🎨 **Board diagram — what you built ↔ what Redux calls it:**
> ```
>   WHAT YOU BUILT TODAY            REDUX'S NAME FOR IT
>   ===========================     ===========================
>   FavoritesProvider value     →   the STORE
>   favoritesReducer            →   a slice REDUCER
>   { type:'TOGGLE', payload }  →   an ACTION
>   toggleFavorite()            →   an ACTION CREATOR
>   dispatch(...)               →   dispatch(...)        (same word!)
>   useFavorites()              →   useSelector + useDispatch
> ```

> 🎤 **So why graduate to the library?** *"Four reasons. (1) **DevTools time-travel** — see every action, rewind, replay, inspect state at each step. (2) **Middleware & async** — clean, standard patterns for API calls (`createAsyncThunk`, RTK Query). (3) **Performance** — fine-grained selectors so a component re-renders only when ITS slice changes (remember Context's re-render-everyone gotcha?). (4) **Conventions** — when many engineers share a codebase, predictable structure is a feature. We're going to actually migrate Tasty's favorites to Redux right now, and you'll see how small the change is — because we were smart and hid favorites behind a custom hook."*

### 4.2 Install Redux Toolkit and build the store

Modern Redux is written with **Redux Toolkit (RTK)** — the official, batteries-included toolset. The old "endless boilerplate" reputation is gone: RTK bundles `configureStore` (a preconfigured store with good defaults and DevTools wired up), `createSlice` (generates a reducer + matching action creators in one call), `createAsyncThunk` (async logic), and RTK Query (a full server-cache layer).

Install both RTK and the React bindings:

```bash
npm install @reduxjs/toolkit react-redux
```

**(a) The slice — `src/store/favoritesSlice.js`.** A "slice" is one feature's state plus its reducers in a single file. The magic: `createSlice` uses the **Immer** library under the hood, so you can write what *looks* like mutating code and still get safe, immutable updates.

```js
// src/store/favoritesSlice.js
import { createSlice } from '@reduxjs/toolkit'

function getInitial() {
  try {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: getInitial(),
  reducers: {
    // ⚠️ Inside RTK you CAN "mutate" — Immer turns it into an immutable update.
    // (This is the OPPOSITE of our hand-written useReducer, where mutation was banned!)
    toggleFavorite(state, action) {
      const meal = action.payload
      const i = state.findIndex((m) => m.idMeal === meal.idMeal)
      if (i >= 0) {
        state.splice(i, 1)
      } else {
        state.push({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb })
      }
    },
    removeFavorite(state, action) {
      return state.filter((m) => m.idMeal !== action.payload)
    },
    clearFavorites() {
      return []
    },
  },
})

// createSlice auto-generates the action creators from the reducer names.
export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions
export default favoritesSlice.reducer
```

> 🎤 *"Compare this to your hand-written reducer from Part 2 — it's the same three cases. But you didn't write a `switch`, you didn't write the action creators (RTK generated `toggleFavorite`, `removeFavorite`, `clearFavorites` from the reducer names), and Immer let you write `state.push(...)`. Less code, same behavior."*

**(b) The store — `src/store/store.js`:**

```js
// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import favoritesReducer from './favoritesSlice.js'

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,   // → state.favorites is owned by this slice
  },
})

// Persist favorites to localStorage whenever the store changes.
store.subscribe(() => {
  localStorage.setItem('favorites', JSON.stringify(store.getState().favorites))
})
```

> 🗒️ `configureStore` wires up Redux DevTools and sensible middleware automatically — zero setup. We'll see DevTools in 4.4.

### 4.3 The elegant swap: migrate favorites with almost no component changes

> 🎤 **Script (this is the lesson's reward):** *"Here's why Part 3's custom hook was so important. Every component reads favorites through `useFavorites()` — none of them know or care HOW it works inside. So to move favorites from Context to Redux, we rewrite ONLY the hook's internals and swap the provider. The component bodies don't change at all. THAT is the payoff of programming to a clean interface."*

**Step 1 — Swap the provider in `src/main.jsx`.** Replace the Context `FavoritesProvider` with Redux's `<Provider store={store}>`. We're keeping `ThemeProvider` on Context (more on that below).

**Replace `src/main.jsx` entirely with:**

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'         // 👈 Redux bindings
import { store } from './store/store.js'       // 👈 our store
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'  // theme stays on Context

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
```

> 🎤 **Why keep theme in Context? (say this — it's a real-world lesson):** *"Not everything belongs in Redux. Theme is one tiny value that rarely changes — Context handles it perfectly, with zero ceremony. A common professional mistake is dumping ALL state into Redux. Use the store for shared, app-wide, frequently-updated state; leave simple stuff in Context or local `useState`. We'll move theme to Redux as homework so you can compare — but mixing them like this is legitimate, not a hack."*

**Step 2 — Rewrite `useFavorites` to be Redux-backed.** This new hook returns the **exact same shape** (`favorites`, `isFavorite`, `toggleFavorite`, `removeFavorite`, `clearFavorites`) the Context version did — that's the whole trick.

**Create `src/hooks/useFavorites.js`:**

```js
// src/hooks/useFavorites.js
import { useSelector, useDispatch } from 'react-redux'
import {
  toggleFavorite as toggleAction,
  removeFavorite as removeAction,
  clearFavorites as clearAction,
} from '../store/favoritesSlice.js'

// Same public shape as our old Context hook → components don't change.
export function useFavorites() {
  const favorites = useSelector((state) => state.favorites)   // read the slice
  const dispatch = useDispatch()                               // get dispatch

  return {
    favorites,
    isFavorite: (id) => favorites.some((m) => m.idMeal === id),
    toggleFavorite: (meal) => dispatch(toggleAction(meal)),
    removeFavorite: (id) => dispatch(removeAction(id)),
    clearFavorites: () => dispatch(clearAction()),
  }
}
```

**Step 3 — Update the import path in the four consumers.** Their function bodies stay exactly the same; only the line that imports `useFavorites` moves from the old context file to the new hook file. In each of **`Navbar.jsx`**, **`RecipeCard.jsx`**, **`RecipeDetail.jsx`**, and **`Favorites.jsx`**, change:

```jsx
// from:
import { useFavorites } from '../context/FavoritesContext.jsx'
// to:
import { useFavorites } from '../hooks/useFavorites.js'
```

> 🎤 *"That's it for the components — one import line each, and only because we relocated the hook. If we'd kept the hook in the same file, even these lines wouldn't change. The `const { favorites, isFavorite, toggleFavorite } = useFavorites()` calls are untouched."*

**Step 4 — Delete the old Context favorites.** Favorites no longer live in Context, so **delete `src/context/FavoritesContext.jsx`** (the provider, the hand-written reducer, and the old `useFavorites` all go). Keep **`src/context/ThemeContext.jsx`** — theme still uses it.

> 🗒️ Keep the Part 2 hand-written reducer in your notes/git history — it's the best mental model for what `createSlice` does for you.

> ✅ **CHECKPOINT 4 (favorites now run on Redux):** Run the app. Everything works exactly as before: Save from Browse updates the navbar count, the detail page shows "♥ Saved," category cards still favorite, the Favorites page lists them, Clear-all empties them, and a refresh persists them. The user sees zero difference — but favorites are now powered by a real Redux store. Same behavior, professional plumbing.

### 4.4 See it work: Redux DevTools (the payoff)

> 🎤 **Script:** *"Here's the concrete reason teams love Redux. Install the **Redux DevTools** browser extension (Chrome/Firefox), reload the app, and open the Redux tab in DevTools. Now favorite a few recipes."*

What students will see, and should try:
1. Each Save fires a labelled action — `favorites/toggleFavorite` — in a timeline.
2. Clicking any past action shows the **state before and after**, with a diff.
3. **Time-travel:** click an earlier action and the UI rewinds to that exact state; click forward to replay.

> 🎤 *"This is the gold-standard debugging story Redux gives you that plain Context does not: a complete, replayable history of every change in your app. For a small app it's a nice-to-have; for a big one it's a lifesaver when you're hunting 'how did the state get into THIS shape?'"*

> ✅ **CHECKPOINT 5:** You can see `favorites/toggleFavorite` actions logging in Redux DevTools and can time-travel through them. (No code needed — this is the store you already built showing its work.)

### 4.5 Context vs Redux: when to reach for which

> 🎤 **Script:** *"You now know both tools first-hand. There's no universal winner — there's 'right for this app.' Be honest with students here."*

| | Context + useReducer | Redux Toolkit |
|---|---|---|
| Install size | 0 KB (built into React) | ~13 KB gzipped |
| Provider needed? | Yes | Yes |
| Boilerplate | Low–medium | Medium (slice + store + provider) |
| DevTools / time-travel | No | **Yes (gold standard)** |
| Async helpers | Roll your own | `createAsyncThunk`, RTK Query |
| Re-render control | Coarse (split contexts / `useMemo`) | Fine (selectors) |
| Best for | Small apps; simple, low-churn global state (theme, locale, auth flag) | Larger apps/teams; rich global state; DevTools; server-cache via RTK Query |

> 🎤 **The honest verdict (say it plainly):** *"Tasty is small. Strictly speaking, Context + useReducer — what we built first — would be enough to ship it, and we even kept theme there on purpose. So why learn Redux? Because the moment you join a real production team, you WILL meet it; because DevTools time-travel is genuinely powerful; and because it scales to state that Context starts to strain under. You learned the concepts by hand first, so Redux isn't magic — it's the formalized, tooled-up version of what you already understand."*

> 🗒️ Bundle-size figures are from the Redux Toolkit docs/comparisons (current as of 2026) and shift slightly by version — treat them as directional.

---

## PART 5 — `React.memo`, `useMemo`, `useCallback`: Performance Patterns (≈50 min)

### 5.1 The "why" — see the wasted work before fixing it

> 🎤 **Script:** *"Redux and Context solved a correctness problem — data reaching the right places. They didn't solve a performance problem, and they can quietly create one: every time shared state changes, React re-renders everything that reads it. Today we make that visible, then fix it with three small, related tools."*

Open the running app, go to **Browse**, open the browser console, and add a temporary log to prove the point.

**Temporarily add this one line inside `RecipeCard`** (top of the function body, in `src/components/RecipeCard.jsx`):

```jsx
console.log('🔁 RecipeCard rendered:', meal.strMeal)
```

> 🎤 **Run the experiment:** *"Search for 'chicken' so the grid fills with cards. Now click into the search box and type one more letter — don't even press Search. Watch the console."*

What they'll see: **every card logs again**, on every keystroke — even though `meals` hasn't changed yet (the fetch only re-runs after you submit). Why? **Typing updates `input`, a piece of `Browse`'s own state. React re-renders `Browse`, and by default every component it returns gets re-invoked too — regardless of whether that component's own props changed.** That re-invocation is wasted work here: each `RecipeCard`'s output would be identical.

> 🎨 **Board diagram:**
> ```
>   DEFAULT REACT BEHAVIOR
>   =======================
>   Browse re-renders (because `input` changed)
>        │
>        ▼  React re-invokes EVERY child function component
>        │     it returns, even ones whose PROPS are unchanged
>        ▼
>   RecipeCard, RecipeCard, RecipeCard, RecipeCard  (all re-run, all wasted)
>
>   THE FIX: React.memo
>   ====================
>   "Before re-running this component, compare its new props to its old
>    props. If every prop is === to last time, SKIP — reuse last result."
> ```

> 🎤 **Analogy:** *"Without `memo`, every component is an employee who redoes their whole report from scratch any time ANYTHING happens in the building, even if nothing on their desk changed. `React.memo` tells one specific employee: 'first check if your inputs actually changed — if not, hand in yesterday's report again.'"*

### 5.2 Fix it with `React.memo`

> 🎤 *"`memo` is a function that wraps a component and adds that props-comparison check. It compares each prop with `Object.is` (basically `===`) — cheap, shallow, fast."*

**Update `src/components/RecipeCard.jsx`** — wrap the export in `memo`. Replace the file with:

```jsx
// src/components/RecipeCard.jsx
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites.js'

function RecipeCard({ meal, onView }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(meal.idMeal)

  // 🔁 keep this log for now — we'll watch it stop firing
  console.log('🔁 RecipeCard rendered:', meal.strMeal)

  function handleViewClick() {
    if (onView) onView(meal.idMeal)   // optional analytics hook — see 5.4
  }

  return (
    <div className="recipe-card">
      <style>{`
        .recipe-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); display: flex; flex-direction: column; transition: transform 0.15s, box-shadow 0.15s; }
        .recipe-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
        .recipe-card .card-link { text-decoration: none; color: inherit; }
        .recipe-card .card-img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .recipe-card .card-title { font-size: 15px; font-weight: 600; padding: 12px 12px 8px; margin: 0; }
        .recipe-card .fav-btn { margin: 0 12px 12px; padding: 8px 10px; border: 1px solid #ef6c4d; background: #fff; color: #ef6c4d; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .recipe-card .fav-btn.active { background: #ef6c4d; color: #fff; }
      `}</style>

      <Link to={`/recipe/${meal.idMeal}`} className="card-link" onClick={handleViewClick}>
        <img className="card-img" src={meal.strMealThumb} alt={meal.strMeal} />
        <h3 className="card-title">{meal.strMeal}</h3>
      </Link>

      <button
        className={favorited ? 'fav-btn active' : 'fav-btn'}
        onClick={() => toggleFavorite(meal)}
      >
        {favorited ? '♥ Saved' : '♡ Save'}
      </button>
    </div>
  )
}

// 🔑 memo() wraps the component: skip re-rendering when props are unchanged.
export default memo(RecipeCard)
```

> 🗒️ We also added an **optional** `onView` prop here, used starting in 5.4 — ignore it for now, it does nothing yet (`onView` is `undefined` everywhere it's used today).

> ✅ **CHECKPOINT 6:** Repeat the typing experiment in Browse. The console now logs each card **once**, the first time it appears — typing further does **not** re-trigger the logs. `React.memo` correctly noticed `meal` (and the still-`undefined` `onView`) didn't change, and skipped re-running every card.

> 🎤 **One honest caveat (say it so nobody overuses this):** *"Don't wrap every component in `memo` reflexively. The comparison itself costs a little, and for small/cheap components like a `<Loader/>` it's not worth it. Reach for `memo` when a component is either (a) expensive to render or (b) re-renders very often with unchanged props — exactly our card-in-a-list situation."*

### 5.3 `useMemo` — don't redo expensive work that didn't need redoing

> 🎤 **Script (the "why"):** *"`memo` skips re-rendering a COMPONENT. `useMemo` skips recomputing a VALUE inside a component that still needs to render. Let's add a real feature — sort the results — and watch it recompute on every keystroke even though nothing sort-relevant changed."*

**Add a sort toggle to `src/pages/Browse.jsx`.** Update the file — add `useMemo` to the React import, add `sortAsc` state, and compute (then later memoize) the sorted list. Replace the whole file with:

```jsx
// src/pages/Browse.jsx
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMeals, getMealsByCategory, getCategories } from '../api/mealApi.js'
import RecipeCard from '../components/RecipeCard.jsx'
import Loader from '../components/Loader.jsx'

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''

  const [meals, setMeals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState(query)
  const [sortAsc, setSortAsc] = useState(true)   // 🆕 sort toggle

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    async function load() {
      if (!query && !category) { setMeals([]); return }
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

  // 🐢 THE PROBLEM (temporarily, before the fix below): this sort runs on
  // EVERY render of Browse — including every keystroke in the search box —
  // even though `meals` and `sortAsc` haven't changed since the last sort.
  console.log('🐢 sorting', meals.length, 'meals...')
  const sortedMeals = [...meals].sort((a, b) =>
    sortAsc ? a.strMeal.localeCompare(b.strMeal) : b.strMeal.localeCompare(a.strMeal)
  )

  function runSearch() {
    const q = input.trim()
    if (q) setSearchParams({ q })
  }

  function onCategoryChange(e) {
    const c = e.target.value
    if (c) setSearchParams({ category: c })
    else setSearchParams({})
  }

  return (
    <div className="browse">
      <style>{`
        .browse { padding: 24px; }
        .browse .controls { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; align-items: center; }
        .browse input, .browse select {
          padding: 11px 13px; border: 1px solid #cbd2d9; border-radius: 9px; font-size: 15px;
        }
        .browse input { width: 280px; max-width: 90%; }
        .browse .search-btn, .browse .sort-btn {
          padding: 11px 16px; border: none; border-radius: 9px; background: #ef6c4d;
          color: #fff; font-weight: 700; cursor: pointer;
        }
        .browse .sort-btn { background: #fff; color: #1f2933; border: 1px solid #cbd2d9; }
        .browse .result-info { color: #616e7c; margin-bottom: 16px; }
        .browse .grid {
          display: grid; gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        .browse .empty { text-align: center; padding: 60px 0; color: #616e7c; }
      `}</style>

      <h1>Browse Recipes</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
        />
        <button className="search-btn" onClick={runSearch}>Search</button>

        <select value={category} onChange={onCategoryChange}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.idCategory} value={c.strCategory}>{c.strCategory}</option>
          ))}
        </select>

        <button className="sort-btn" onClick={() => setSortAsc((s) => !s)}>
          Sort {sortAsc ? 'A→Z' : 'Z→A'}
        </button>
      </div>

      {category && <p className="result-info">Showing category: <strong>{category}</strong></p>}
      {!category && query && <p className="result-info">Results for: <strong>{query}</strong></p>}

      {loading ? (
        <Loader label="Searching…" />
      ) : !query && !category ? (
        <div className="empty">
          <p>🔎 Type a dish name or pick a category to start exploring.</p>
        </div>
      ) : sortedMeals.length === 0 ? (
        <div className="empty">
          <p>No recipes found. Try another search.</p>
        </div>
      ) : (
        <div className="grid">
          {sortedMeals.map((meal) => (
            <RecipeCard key={meal.idMeal} meal={meal} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Browse
```

> 🎤 **Run the experiment:** *"Search 'chicken', watch the console log `🐢 sorting 12 meals...` once. Now type another letter in the box. It logs AGAIN — a full re-sort — even though the meals list and the sort direction are exactly what they were a second ago. With 12 items that's nothing. With 1,200 it's a stutter on every keystroke."*

> 🗒️ Note the second bug we fixed along the way: `[...meals].sort(...)` — we copy the array before sorting. `.sort()` **mutates in place**; sorting `meals` directly would quietly corrupt the original array. Always copy before sorting state-derived data.

**Now fix it — wrap the computation in `useMemo`.** Replace just the sorting block:

```jsx
  // ✅ THE FIX: only re-sort when `meals` or `sortAsc` actually changed.
  // Typing in the search box (which only changes `input`) no longer
  // triggers a re-sort, because neither dependency moved.
  const sortedMeals = useMemo(() => {
    console.log('🐢 sorting', meals.length, 'meals...')
    return [...meals].sort((a, b) =>
      sortAsc ? a.strMeal.localeCompare(b.strMeal) : b.strMeal.localeCompare(a.strMeal)
    )
  }, [meals, sortAsc])
```

> 🎤 *"`useMemo(calculateFn, deps)` caches the RETURN VALUE of `calculateFn` and only re-runs it when something in `deps` changed. Everything else — typing, theme toggling, favoriting a card — leaves the cached `sortedMeals` untouched."*

> ✅ **CHECKPOINT 7:** Type in the search box again. The `🐢 sorting...` log now fires **only** when you actually search or click the sort button — not on every keystroke. Click **Sort A→Z/Z→A** — it still re-sorts correctly (because `sortAsc` is a dependency).

> 🎤 **Caveat (say it):** *"`useMemo` isn't free either — it has to remember last time's deps and compare them. For a `.sort()` on a small array, you genuinely might not need it. We're using a small list here to TEACH the pattern; reach for `useMemo` for real when a computation is legitimately expensive (sorting/filtering thousands of rows, heavy math, building derived structures) — not as a reflex on every line."*

### 5.4 `useCallback` — keeping `memo` honest when you pass functions down

> 🎤 **Script (the "why" — this is the subtle one):** *"We wrapped `RecipeCard` in `memo` in 5.2. That works great as long as every PROP we hand it stays `===` across renders. Primitives and stable objects are fine. But a brand-new arrow function passed as a prop is a NEW reference every single render — even if it does the exact same thing — and that alone defeats `memo`. Let's prove it, using the `onView` prop we already added."*

**Wire up `onView` in `Browse.jsx` — the broken way first.** Add this function inside `Browse` (anywhere above the `return`):

```jsx
  // 🐢 THE PROBLEM: this is a NEW function on every render of Browse.
  function handleView(id) {
    console.log('👁 viewed recipe id:', id)
  }
```

...and pass it down in the grid:

```jsx
          {sortedMeals.map((meal) => (
            <RecipeCard key={meal.idMeal} meal={meal} onView={handleView} />
          ))}
```

> 🎤 **Run the experiment:** *"Add the `console.log('🔁 RecipeCard rendered: ...')` back if you removed it. Type in the search box. The cards re-render AGAIN on every keystroke — `memo` looks broken! It isn't. `meal` is still the same reference... but `onView` is now a freshly-created function every time `Browse` re-renders, so `memo`'s prop comparison sees a 'changed' prop and re-renders the card anyway."*

> 🎨 **Board diagram:**
> ```
>   WHY A NEW FUNCTION DEFEATS memo
>   ================================
>   Render 1:  onView = function#A   (just created)
>   Render 2:  onView = function#B   (a DIFFERENT function object,
>                                      even though the CODE is identical)
>
>   memo compares:  function#A === function#B  →  FALSE  →  re-render anyway
> ```

> 🎤 **Analogy:** *"Two photocopies of the same letter are still two different pieces of paper. `memo` checks 'is this the EXACT SAME PAPER as last time,' not 'does it say the same thing.' A freshly-made function is a fresh piece of paper every time, even with identical contents."*

**Fix it — wrap `handleView` in `useCallback`.** Update the React import and the function:

```jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
```

```jsx
  // ✅ THE FIX: the SAME function reference is reused across renders,
  // because the dependency array is empty — this function never needs
  // to change. memo's comparison now sees an unchanged `onView` prop.
  const handleView = useCallback((id) => {
    console.log('👁 viewed recipe id:', id)
  }, [])
```

> 🎤 *"`useCallback(fn, deps)` is `useMemo`, specialized for caching a FUNCTION instead of a computed value. Same rule: it only hands out a new function when something in `deps` changes."*

> ✅ **CHECKPOINT 8:** Type in the search box once more. The `🔁 RecipeCard rendered` logs are gone again — `onView` is now referentially stable, so `memo`'s comparison passes for every prop, and the cards correctly skip re-rendering.

> 🎤 **The rule of thumb to leave them with:** *"`useCallback` is not a general performance hammer — its ENTIRE point is keeping a function's reference stable so something downstream (usually a `memo`-wrapped component, or a `useEffect`/`useMemo` dependency array) doesn't get fooled into thinking it changed. If nothing downstream cares about reference identity, `useCallback` buys you nothing but extra bookkeeping."*

**Cleanup:** remove the two temporary `console.log` lines (the `🔁 RecipeCard rendered` one in `RecipeCard.jsx` and the `🐢 sorting` one can stay or go — your call) once the class has seen them fire and stop firing.

### 5.5 The three tools, side by side

| Tool | Memoizes | Use it when | Our example |
|---|---|---|---|
| `React.memo` | A **component's** rendered output | A component re-renders often with unchanged props | Wrapping `RecipeCard` |
| `useMemo` | A **computed value** | An expensive calculation shouldn't redo on unrelated re-renders | `sortedMeals` |
| `useCallback` | A **function reference** | A function is passed to a `memo`-wrapped child (or used as a dependency elsewhere) | `handleView` |

> 🎤 **Closing thought for this part:** *"All three exist for ONE reason: skip work React doesn't need to redo. They're optimizations, not correctness fixes — your app worked fine without them. Reach for them when you've actually MEASURED or OBSERVED wasted re-renders (like we just did with `console.log`), not by default on every component and function you write. Premature memoization adds complexity for no benefit."*

---

## PART 6 — Forms in React (the "Add Your Own Recipe" feature) (≈50 min)

> 🎤 **Framing:** *"So far Tasty only ever READS recipes from the API. Real apps let users create data too — and that means forms. We'll build an 'Add Your Own Recipe' page: a proper multi-field form with validation that, on submit, dispatches straight into the Redux store we just built and shows up in a new 'My Recipes' page. Forms tie together everything today: controlled state, Redux, and the router."*

### 6.1 The "why" — who owns the input's value?

> 🎤 **Script:** *"A plain HTML `<input>` keeps its own value inside the browser's DOM — React has no idea what you typed until you dig it out. That's called an **uncontrolled** input. In React we usually flip it around: React state holds the value, and the input just DISPLAYS it. That's a **controlled** input, and it's the whole game. Once React owns the value, you can validate as they type, disable the submit button, transform input, reset the form — all trivially, because the data lives in one place you control."*

> 🎨 **Board diagram — uncontrolled vs controlled:**
> ```
>   UNCONTROLLED (browser owns the value)
>   ======================================
>   <input>  ← value lives in the DOM; React must "go ask" for it
>
>   CONTROLLED (React owns the value)
>   ==================================
>   state:  title = "Cur"                    ┌─────────────┐
>   <input value={title}                     │  one source │
>          onChange={e => setTitle(e.target.value)} />  →   │  of truth   │
>            │                                           └─────────────┘
>            └── every keystroke: update state → React re-renders → input shows new value
> ```

> 🎤 **Analogy:** *"An uncontrolled input is a whiteboard in someone else's office — to know what it says, you have to walk over and look. A controlled input is a Google Doc you own: the text lives in your state, and the input is just a live view of it. You always know the value, instantly."*

You've already used a controlled input — the search box (`value={input} onChange={...}`). Today we scale that one pattern up to a whole form.

### 6.2 A place for the form's data to land: a `recipes` Redux slice

> 🎤 *"Where do submitted recipes go? Not the API (it's read-only for us). Into our own Redux store — a second slice next to favorites. This is also a great chance to see a store grow to more than one slice."*

**Create `src/store/recipesSlice.js`:**

```js
// src/store/recipesSlice.js
import { createSlice } from '@reduxjs/toolkit'

function getInitial() {
  try {
    const saved = localStorage.getItem('myRecipes')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: getInitial(),
  reducers: {
    addRecipe(state, action) {
      state.unshift(action.payload)   // Immer: newest first, safely
    },
    deleteRecipe(state, action) {
      return state.filter((r) => r.id !== action.payload)
    },
  },
})

export const { addRecipe, deleteRecipe } = recipesSlice.actions
export default recipesSlice.reducer
```

**Register it in the store — update `src/store/store.js`:**

```js
// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import favoritesReducer from './favoritesSlice.js'
import recipesReducer from './recipesSlice.js'   // 👈 add

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    recipes: recipesReducer,                      // 👈 add → state.recipes
  },
})

// Persist both slices to localStorage on every change.
store.subscribe(() => {
  const state = store.getState()
  localStorage.setItem('favorites', JSON.stringify(state.favorites))
  localStorage.setItem('myRecipes', JSON.stringify(state.recipes))  // 👈 add
})
```

> ✅ Nothing visible changes yet — but `state.recipes` now exists in the store, ready to receive form submissions.

### 6.3 Build the form (the whole file, then we walk through it)

> 🎤 *"Here's the complete form component. It looks like a lot, but it's really the SAME small pattern repeated across field types, plus validation and submit. Create it, then we'll dissect the five ideas inside it."*

**Create `src/pages/AddRecipe.jsx`:**

```jsx
// src/pages/AddRecipe.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addRecipe } from '../store/recipesSlice.js'

const CATEGORIES = ['Beef', 'Chicken', 'Dessert', 'Pasta', 'Seafood', 'Vegetarian', 'Breakfast', 'Side', 'Miscellaneous']

const EMPTY_FORM = {
  title: '',
  category: 'Chicken',
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
```

Now the **five ideas** inside that file — teach them by pointing at the numbered comments:

> 🎤 **1️⃣ One state object for many fields.** *"Instead of a `useState` per field, we keep one `form` object. Fewer lines, and the whole form is one value we can log, reset (`setForm(EMPTY_FORM)`), or submit in one go."*

> 🎤 **2️⃣ One handler via the `name` attribute.** *"This is the trick that makes big forms bearable. Each input has a `name` matching a key in our state. The single `handleChange` reads `e.target.name` and updates THAT key: `setForm(prev => ({ ...prev, [name]: value }))`. One function, any number of fields. Note the checkbox branch — checkboxes carry their state in `checked`, not `value`."*

> 🎤 **3️⃣ Every input type, same idea.** *"Text, textarea, select, checkbox, radio — all controlled the same way: bind the value (or `checked`), handle the change. A `<select>`'s value is the chosen `<option>`'s value; a radio group shares one `name` and each option checks `value === form.difficulty`."*

> 🎤 **4️⃣ Dynamic fields.** *"Ingredients aren't a fixed field — the user adds as many as they want. So they're an ARRAY in state, and add/remove/update are just array operations (`spread`, `filter`, `map`) — the exact skills from our favorites reducer. Notice each row has a stable `id` and we key on `ing.id`, NOT the array index — keying on index breaks focus and values when you delete a middle row."*

> 🎤 **5️⃣ `useRef` for focus.** *"`useRef` gives us a direct handle to a DOM node without causing re-renders. We attach it with `ref={titleRef}` and, on mount, call `titleRef.current.focus()` so the cursor lands in the Title field automatically. That's the most common beginner use of refs: reaching a real DOM element for focus, scroll, or measurement."*

> ✅ **CHECKPOINT 9:** Add a temporary route to reach the page (next step) or render `<AddRecipe/>` directly. Open the **"Peek at the live form state"** panel and type in the fields. The JSON updates on **every keystroke** — proof the inputs are controlled and React owns every value. Add and remove ingredient rows; the `ingredients` array grows and shrinks in the live state.

### 6.4 Validation & submit — the payoff

> 🎤 **Script:** *"Two things make a form real: it refuses bad data, and its submit does something. Look at `handleSubmit`. First line: `e.preventDefault()` — without it, the browser does its ancient default of RELOADING the whole page on submit, throwing away our SPA. Then we `validate()`; if there are errors we drop them into `errors` state (which renders the red messages) and bail. Only clean data gets built into a recipe object and `dispatch`ed into Redux — then we `navigate` away. Validation, Redux, and the router, all in one handler."*

> 🎨 **Board diagram — the submit flow:**
> ```
>   user clicks "Save Recipe"
>        │
>        ▼  onSubmit(e)
>   e.preventDefault()          ← stop the full-page reload
>        │
>        ▼
>   validate() → errors?  ──yes──►  setErrors(...)  → red messages show, STOP
>        │ no
>        ▼
>   build recipe object → dispatch(addRecipe(recipe)) → navigate('/my-recipes')
> ```

> ✅ **CHECKPOINT 10:** Click **Save Recipe** with the form empty → three red error messages appear (title, ingredients, instructions) and nothing is submitted. Fill them in validly → the errors clear and the form submits. (It navigates to `/my-recipes`, which we build next.)

### 6.5 Integration — routes, navbar, and the "My Recipes" page

**(a) Create `src/pages/MyRecipes.jsx`** — reads recipes from the store and can delete them:

```jsx
// src/pages/MyRecipes.jsx
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { deleteRecipe } from '../store/recipesSlice.js'

function MyRecipes() {
  const recipes = useSelector((state) => state.recipes)
  const dispatch = useDispatch()

  return (
    <div className="my-recipes">
      <style>{`
        .my-recipes { padding: 24px; }
        .my-recipes .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
        .my-recipes .add-link { background: #ef6c4d; color: #fff; padding: 9px 14px; border-radius: 9px; text-decoration: none; font-weight: 700; }
        .my-recipes .empty { text-align: center; padding: 60px 0; color: #616e7c; }
        .my-recipes .empty a { color: #ef6c4d; font-weight: 700; }
        .my-recipes .recipe-list { display: flex; flex-direction: column; gap: 20px; }
        .my-recipes .my-card { display: flex; gap: 18px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .my-recipes .my-card img { width: 180px; height: 180px; object-fit: cover; flex-shrink: 0; }
        .my-recipes .my-card .body { padding: 14px 16px; flex: 1; }
        .my-recipes .my-card h2 { margin: 0 0 4px; }
        .my-recipes .my-card .meta { color: #616e7c; margin: 0 0 10px; font-size: 14px; }
        .my-recipes .my-card h3 { margin: 8px 0 4px; font-size: 14px; }
        .my-recipes .my-card ul { margin: 0 0 8px; padding-left: 18px; }
        .my-recipes .my-card .instructions { white-space: pre-wrap; line-height: 1.5; margin: 0; }
        .my-recipes .delete-btn { margin-top: 10px; background: #fff; border: 1px solid #cf1124; color: #cf1124; border-radius: 8px; padding: 7px 12px; cursor: pointer; font-weight: 600; }
        @media (max-width: 620px) { .my-recipes .my-card { flex-direction: column; } .my-recipes .my-card img { width: 100%; height: 200px; } }
      `}</style>

      <div className="head">
        <h1>My Recipes ({recipes.length})</h1>
        <Link to="/add-recipe" className="add-link">+ Add a recipe</Link>
      </div>

      {recipes.length === 0 ? (
        <div className="empty">
          <p>You haven't added any recipes yet. <Link to="/add-recipe">Create your first →</Link></p>
        </div>
      ) : (
        <div className="recipe-list">
          {recipes.map((r) => (
            <article className="my-card" key={r.id}>
              <img src={r.image} alt={r.title} />
              <div className="body">
                <h2>{r.title} {r.vegetarian && '🌱'}</h2>
                <p className="meta">{r.category} · {r.area} · {r.difficulty}</p>
                <h3>Ingredients</h3>
                <ul>{r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                <h3>Instructions</h3>
                <p className="instructions">{r.instructions}</p>
                <button className="delete-btn" onClick={() => dispatch(deleteRecipe(r.id))}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyRecipes
```

**(b) Add the routes in `src/App.jsx`** — add the imports and two routes inside the Layout route (anywhere among the children, before the `*` catch-all):

```jsx
import AddRecipe from './pages/AddRecipe.jsx'   // 👈 add
import MyRecipes from './pages/MyRecipes.jsx'   // 👈 add
```

```jsx
        <Route path="add-recipe" element={<AddRecipe />} />
        <Route path="my-recipes" element={<MyRecipes />} />
```

**(c) Add navbar links in `src/components/Navbar.jsx`** — after the Favorites `NavLink`:

```jsx
      <NavLink to="/my-recipes" className={linkClass}>My Recipes</NavLink>
      <NavLink to="/add-recipe" className={linkClass}>+ Add</NavLink>
```

> ✅ **CHECKPOINT 11 (the full loop):** Click **+ Add**, fill in a recipe (title, an ingredient or two, instructions), pick a category, tick Vegetarian, choose a difficulty, hit **Save Recipe**. You land on **My Recipes** and see your recipe rendered from the Redux store. **Refresh the browser** — it's still there (persisted via `store.subscribe`). Click **Delete** — it vanishes and the count drops. A complete create-read-delete loop, powered by a form → Redux → localStorage.

### 6.6 Two short but important asides

> 🎤 **Controlled vs uncontrolled (name the alternative).** *"We built a fully CONTROLLED form — React state owns every value. The alternative is UNCONTROLLED inputs, where you skip `value`/`onChange` and just read the DOM with a `ref` at submit time (like our `titleRef`, but for reading instead of focusing). Uncontrolled is handy for simple or one-off inputs, and it's the only option for `<input type='file'>` (you can't set a file input's value in code for security reasons). Rule of thumb: reach for controlled by default — you get validation and live feedback for free — and drop to uncontrolled/`ref` for file inputs or when you truly don't need React to track keystrokes."*

> 🎤 **The modern React 19 way (mention, don't build today).** *"React 19 adds a newer forms story built on **Actions**: you can pass a function straight to `<form action={fn}>`, and hooks like `useActionState` (track pending/result of a submit) and `useFormStatus` (let a nested submit button know the form is submitting) remove a lot of the manual `useState` wiring — especially when the submit talks to a server. It's genuinely nice, but it makes the most sense once you're doing server work, so we're teaching the controlled-state fundamentals first. Everything you learned here still applies; Actions sit on top of it."*

> 🗒️ **Currency note (for the instructor):** `crypto.randomUUID()` works in every modern browser in a secure context — and `localhost` counts as secure, so it's fine in Vite dev and in production over HTTPS. If you ever deploy over plain `http://` on a LAN IP, swap it for `Date.now() + Math.random()`.

---

## PART 7 — Server-Side Rendering (SSR): Concepts + a Minimal Demo (≈40 min)

### 7.1 The "why" — bring back the MPA-vs-SPA story, one layer deeper

> 🎤 **Script:** *"Rewind to the very first thing we taught in the React Router class: old multi-page sites asked the SERVER for a new full HTML page on every click; our SPA asks the server ONCE, then does the rest in the browser. That trade bought us instant navigation — but it cost us something we glossed over: on that FIRST request, the server now sends back a nearly empty HTML shell. The browser has to download our JS, run it, THEN build the page. Let's see that cost, then meet the fix: Server-Side Rendering."*

**Show it live:** open Tasty's deployed/dev page, View Source (not DevTools — the literal `Ctrl+U` / "View Page Source"). Point at the `<div id="root"></div>` — empty. Everything visible on screen was built by JavaScript, after the fact.

> 🎨 **Board diagram — what the server sends, CSR vs SSR:**
> ```
>   CLIENT-SIDE RENDERING (what Tasty does today)
>   ===============================================
>   Server sends:  <div id="root"></div>  +  a JS bundle
>   Browser must:  download JS → run JS → THEN build the page
>   Result:        blank screen for a beat; search engines/crawlers
>                  that don't run JS see... nothing.
>
>   SERVER-SIDE RENDERING (SSR)
>   ============================
>   Server sends:  <div id="root"><h1>Tasty</h1>...FULL HTML...</div>
>                  +  the SAME JS bundle
>   Browser:       paints real content IMMEDIATELY (no JS needed yet)
>                  then JS loads and "hydrates" — attaches event
>                  handlers to the HTML that's already there
>   Result:        fast first paint, crawlers see real content
> ```

> 🎤 **Analogy:** *"CSR mails you a flat-pack box of furniture parts and an instruction booklet — you build it yourself in your living room before you can sit down. SSR mails you the FINISHED chair — you sit immediately — and separately includes a small kit so the chair can later recline and swivel (that 'kit' is hydration: attaching interactivity to HTML that's already sitting there)."*

### 7.2 The honest trade-offs (don't oversell SSR)

> 🎤 **Script:** *"SSR isn't free, and it isn't always the right call — same lesson as the MPA/SPA discussion. Be picky about when you reach for it."*

| | CSR (what Tasty is) | SSR |
|---|---|---|
| First paint | Slower (wait for JS) | **Faster** (HTML arrives ready) |
| SEO / crawlers | Weak unless the crawler runs JS | **Strong** — real HTML on first response |
| Server cost | Cheap — server just serves static files | Higher — server does work on every request |
| Complexity | Lower | Higher (need a Node server or a framework) |
| Best for | App-like, often-behind-login tools (dashboards, our Tasty demo) | Content/SEO-sensitive pages (recipe blogs, marketing, product pages) |

> 🎤 *"If Tasty were a real product — a public recipe site that wanted Google to index every recipe page — SSR would be the right call. As a behind-no-login portfolio SPA, CSR is genuinely fine. Match the tool to the requirement, not the hype."*

### 7.3 How you'd actually do this in production (don't hand-rebuild it)

> 🎤 **Script:** *"You will almost never wire up raw SSR plumbing by hand on a real project — frameworks do it for you. Two paths, both built on React Router, the exact library we've used all term:"*

- **Next.js** — server-renders each route, then does soft client-side navigation between routes afterward (a CSR/SSR hybrid).
- **React Router v7 "framework mode"** — the same `react-router-dom` APIs we've used all term, run in a mode that adds SSR, file-based routing, and data loading. (This used to be a separate project called Remix.)

> 🗒️ *"Migrating Tasty from a Vite SPA to one of these is a real, multi-hour project on its own — out of scope for today. What we CAN do in 40 minutes is see the raw mechanism so SSR stops being a black box."*

### 7.4 A minimal, standalone SSR demo (separate mini-project, not inside Tasty)

> 🎤 **Framing:** *"We're stepping OUT of the Tasty Vite project for this demo — bolting raw SSR onto an existing Vite SPA mid-class is a rabbit hole. Instead we'll build the smallest possible SSR server from scratch in a new folder, render one simple component on the server, and watch it arrive as real HTML."*

**Step 1 — new folder, next to (not inside) `tasty/`:**

```bash
mkdir ssr-demo && cd ssr-demo
npm init -y
npm install express react react-dom
```

**Step 2 — the component to render — `Greeting.jsx`:**

```jsx
// ssr-demo/Greeting.jsx
function Greeting({ name }) {
  return (
    <div className="greeting">
      <style>{`
        .greeting { font-family: system-ui, sans-serif; padding: 40px; text-align: center; }
        .greeting h1 { color: #ef6c4d; }
      `}</style>
      <h1>🍴 Hello from the server, {name}!</h1>
      <p>This HTML existed before any JavaScript ran in your browser.</p>
    </div>
  )
}

export default Greeting
```

**Step 3 — the server — `server.jsx`:**

```jsx
// ssr-demo/server.jsx
import express from 'express'
import { renderToString } from 'react-dom/server'
import Greeting from './Greeting.jsx'

const app = express()

app.get('/', (req, res) => {
  // 🔑 THE WHOLE LESSON IN ONE LINE:
  // turn a React element into a real HTML string, on the SERVER,
  // before anything is sent to the browser.
  const appHtml = renderToString(<Greeting name="Class" />)

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>SSR Demo</title></head>
      <body>
        <div id="root">${appHtml}</div>
      </body>
    </html>
  `)
})

app.listen(3001, () => console.log('SSR demo running on http://localhost:3001'))
```

**Step 4 — run it.** This file uses JSX, so the simplest classroom path is Node's experimental JSX support, or a one-line build step. The fastest no-config option is `tsx` (an on-the-fly JSX/TS runner):

```bash
npm install -D tsx
npx tsx server.jsx
```

Visit `http://localhost:3001`.

> ✅ **CHECKPOINT 12:** View Source (`Ctrl+U`) on `http://localhost:3001`. Unlike Tasty's `<div id="root"></div>`, you see the **actual rendered HTML** — `<h1>🍴 Hello from the server, Class!</h1>` — sitting inside `<div id="root">`, sent directly by the server. No JavaScript ran yet, and the content is already there.

> 🎤 **What's missing on purpose (say this, then stop — don't build it live):** *"Right now this page is static HTML with zero interactivity — there's no `hydrateRoot()` call wiring up event handlers, so a button here wouldn't click. The missing piece is called **hydration**: the browser downloads the same component's JS, calls `hydrateRoot()` on `#root`, and React 'attaches' itself to the existing HTML instead of rebuilding it — giving you working `onClick`s etc. without throwing away the server's HTML. That hand-off is exactly what Next.js and React Router's framework mode automate for you, which is why production teams don't hand-write this part."*

> 🗒️ **For the instructor — currency note:** `renderToString` is still supported in React 19 and is the simplest API to teach a first SSR concept with, but the React team's current recommendation for real Node servers is the streaming `renderToPipeableStream` (better `<Suspense>` support, sends HTML progressively). `renderToString` is intentionally used here because it returns a plain string synchronously — easiest to reason about live in class. Mention the streaming API by name as the production-grade next step; don't build it live unless you have extra time.

### 7.5 SSR recap

| Term | Meaning |
|---|---|
| CSR (Client-Side Rendering) | Server sends an empty shell + JS; the browser builds the page |
| SSR (Server-Side Rendering) | Server sends real, already-rendered HTML; JS "hydrates" it after |
| Hydration | Attaching React's event handlers to server-rendered HTML, without rebuilding it |
| `renderToString` | Turns a React element into an HTML string, on the server (simple, synchronous) |
| `renderToPipeableStream` | The production-recommended Node API — streams HTML, supports `<Suspense>` |
| Next.js / React Router framework mode | The real-world way teams get SSR without hand-building the plumbing |

---

## PART 8 — Recap, Common Mistakes & Homework (≈15 min)

### Common Student Mistakes (keep visible while they code)

| # | Mistake | Symptom | Fix |
|---|---------|---------|-----|
| 1 | Using a context's value without wrapping the app in its Provider | `Cannot read properties of undefined` / your custom hook throws | Wrap `<App/>` in the Provider in `main.jsx` |
| 2 | Calling hooks (`useContext`, `useSelector`, custom hooks) conditionally or in loops | "Rendered more hooks than during the previous render" | Hooks run at the top level of the component, every render, unconditionally |
| 3 | **Mutating** state inside a plain `useReducer` reducer (`state.push(...)`) | UI doesn't update | Return a NEW array (`[...state]`, `.filter`, `.map`) |
| 4 | Assuming RTK slices also forbid mutation | Confusion about rule #3 | RTK uses Immer, so "mutating" is fine **only inside `createSlice`** — never in a hand-written reducer |
| 5 | Putting everything in one giant context | Unrelated components re-render constantly | Split by concern (we used two), and/or `useMemo` the value |
| 6 | New `value={{...}}` object every render with no memo | Extra re-renders in large trees | `const value = useMemo(() => ({...}), [deps])` |
| 7 | `localStorage` raw string vs `JSON.stringify` mismatch | `JSON.parse` throws on load | Stringify on save, parse on load, wrap parse in try/catch |
| 8 | Forgetting the Redux `<Provider store={store}>` wrapper | "could not find react-redux context value" | Wrap the app in `<Provider store={store}>` in `main.jsx` |
| 9 | Selecting the whole store: `useSelector(s => s)` | Component re-renders on every change | Select narrowly: `useSelector(s => s.favorites)` |
| 10 | Dumping ALL state into Redux (even tiny, local stuff) | Boilerplate everywhere, slower dev | Use Redux for shared app-wide state; keep simple state in Context or `useState` |
| 11 | Forgetting `useReducer`'s lazy init and reading localStorage every render | Minor perf waste | Use the 3-arg form: `useReducer(reducer, undefined, initFn)` |
| 12 | Wrapping every component in `React.memo` "just in case" | Code is harder to read, no measurable benefit (sometimes slightly slower) | Only memoize components that are expensive or re-render often with unchanged props |
| 13 | Passing a brand-new inline function (`onClick={() => ...}`) to a `memo`-wrapped child | The child re-renders anyway — `memo` looks "broken" | Wrap the function in `useCallback` so its reference stays stable |
| 14 | Using `useMemo`/`useCallback` with an incomplete dependency array | Stale values inside the memoized function/value | Include every value the function/computation actually reads |
| 15 | Reaching for `useMemo` on cheap computations as a reflex | Extra complexity, no real gain | Measure first (e.g. with `console.log`) — memoize what's actually expensive or actually re-running too often |
| 16 | Assuming a Vite SPA "just" gets SSR by adding `renderToString` somewhere | Confusion / broken routing | SSR needs a server runtime, route-aware rendering, and hydration — use a framework (Next.js, React Router framework mode) for real apps |
| 17 | Forgetting `e.preventDefault()` in the submit handler | The page does a full reload and state is wiped | Call `e.preventDefault()` first thing in `onSubmit` |
| 18 | A helper `<button>` inside a `<form>` has no `type` | Clicking "add ingredient" submits/reloads the form | Give non-submit buttons `type="button"` — only the real one stays `type="submit"` |
| 19 | Controlled `<input value={...}>` with no `onChange` | Field is read-only / won't accept typing | Always pair `value` with an `onChange` that updates state (checkboxes use `checked`) |
| 20 | Using the array index as the `key` for editable/removable rows | Wrong row's text/focus after deleting a middle row | Give each row a stable id and key on that |

### Recap Table — the whole toolkit on one page

| Tool | What it is | Where we used it | One-line mental model |
|------|-----------|------------------|------------------------|
| `createContext` | Makes a shared "channel" | ThemeContext, (originally FavoritesContext) | A radio station |
| Provider | Broadcasts a value to its subtree | `ThemeProvider`, Redux `<Provider>` | The broadcast tower |
| `useContext` | Reads the current context value | `useTheme` | A radio receiver |
| `useReducer` | Centralizes state transitions | FavoritesProvider (Part 2) | One clerk edits the record |
| reducer + action | `(state, action) ⇒ newState` | `favoritesReducer` → the slice | The rulebook for changes |
| `dispatch` | Sends an action to the reducer/store | toggle/remove/clear | "Here's what happened" |
| Custom hook | Reusable function of hook calls | useLocalStorage, useFavorites, useTheme, useFetch | A packaged recipe (and a swappable seam) |
| `createSlice` | State + reducers + actions in one | `favoritesSlice` | A feature's store, auto-wired |
| `configureStore` | Builds the Redux store + DevTools | `store.js` | The store factory |
| `useSelector` / `useDispatch` | Read / write the Redux store | inside `useFavorites` | Receiver + sender for Redux |
| `React.memo` | Skips re-rendering a component | `RecipeCard` | "Same inputs as last time — reuse last result" |
| `useMemo` | Caches a computed value | `sortedMeals` | "Don't redo this math unless its inputs changed" |
| `useCallback` | Caches a function reference | `handleView` | "Hand out the SAME function, not a new copy, each render" |
| Controlled input | `value` + `onChange` bound to state | every field in `AddRecipe` | React state is the single source of truth |
| Single `name` handler | One `onChange` keyed by `e.target.name` | `AddRecipe` `handleChange` | One function updates any field |
| `e.preventDefault()` | Stops the browser's native submit/reload | `handleSubmit` | "Don't reload — I've got this" |
| `useRef` | A handle to a DOM node (no re-render) | focus the title input | A sticky note pointing at an element |
| SSR / `renderToString` | Renders React to HTML on the server | the standalone `ssr-demo` | "Mail the finished chair, not flat-pack parts" |
| Hydration | Attaching interactivity to server-rendered HTML | (conceptual — not hand-built today) | "Bolt the controls onto the chair that already arrived" |

### Homework

**Part A — Move theme into Redux too:** Add a `themeSlice` (a `toggleTheme` reducer), register it in `configureStore`, and rewrite `useTheme` to use `useSelector`/`useDispatch` (same return shape, so `Layout`/`Navbar` barely change). Then delete `ThemeContext.jsx`. Compare the effort to the favorites migration.

**Part B — Wire `removeFavorite` into the UI:** Add a small "✕ Remove" button on each card on the **Favorites page** that dispatches `removeFavorite(meal.idMeal)`. (The action already exists in the slice and the hook.)

**Part C — Finish the custom-hooks refactor:** Convert `Home.jsx` to use `useFetch` (Browse already got its `useMemo`/`useCallback` upgrade in class).

**Part D — Memoize something real:** `RecipeDetail.jsx` calls `extractIngredients(meal)` on every render. It's cheap today, but pretend it's expensive: wrap it in `useMemo` keyed on `meal`, and add a `console.log` inside it to prove it only re-runs when `meal` actually changes (e.g. when you toggle the favorite button on the same page, it should NOT re-run).

**Part E — Extend the SSR demo:** In `ssr-demo`, add a second route (e.g. `/about`) rendering a different component, and pass a `name` query parameter into `<Greeting name={...} />` from `req.query`. Confirm with View Source that the personalized text is already in the server's HTML response.

**Part F — Extend the recipe form:** Add a **cooking time (minutes)** field using `<input type="number">`. Remember `e.target.value` is always a string — convert with `Number(...)` before storing. Reject `0`/blank in `validate()`, and show the time on each card in **My Recipes**.

**Part G — Reflect (short paragraph in your README):**
1. List every component that got *simpler* moving from prop drilling → Context. Why?
2. Migrating favorites to Redux changed almost no component code. Which earlier decision made that possible, and what does that teach you about designing interfaces?
3. We deliberately kept `theme` in Context, not Redux. Give one reason that's a reasonable choice, and one situation where you'd move it to Redux.
4. In your own words: why did passing a new inline function to `RecipeCard` defeat `React.memo`, and how did `useCallback` fix it?
5. Tasty is a CSR SPA. Give one realistic feature request for Tasty that would justify migrating to SSR, and one that wouldn't.
6. Why does a controlled input need BOTH `value` and `onChange`? What breaks if you supply only `value`?

**Stretch:**
- Install the **Redux DevTools** extension, toggle several favorites, and screenshot the action timeline + a time-travel rewind.
- Build a `usePersistedReducer(reducer, key, init)` custom hook that combines `useReducer` + `useLocalStorage`.
- Add a `console.log('theme render')` to a theme-only component and confirm it does NOT re-render when you toggle favorites (proof that keeping favorites in Redux + theme in its own context isolates re-renders).
- Extract each ingredient row into its own `IngredientRow` component, wrap it in `React.memo`, and pass `useCallback`-wrapped handlers — connecting Forms back to Part 5's performance patterns.
- In `ssr-demo`, swap `renderToString` for `renderToPipeableStream` and pipe the result to `res` — compare the response in DevTools' Network tab (look for `Transfer-Encoding: chunked`).

> 🎤 **Closing line:** *"You started Phase 5 drowning in props. You ended it with a real Redux store, a working mental model for when React does — and doesn't need to — redo work, and a first look under the hood of how pages get to the browser before JavaScript even runs. Next time we'll separate CLIENT state (what we did today) from SERVER state — the cached, fetched data — with tools like TanStack Query and RTK Query. That's the last big piece of the modern React data story."*

---
## Appendix — Updated Project Structure (after Phase 5)

```
tasty/
└── src/
    ├── main.jsx                 # Redux <Provider> + BrowserRouter + ThemeProvider wrap App
    ├── App.jsx                  # Pure routing again — zero state, zero prop drilling
    ├── api/
    │   └── mealApi.js           # (unchanged) all TheMealDB calls
    ├── context/                 # theme stays on Context (a deliberate choice)
    │   └── ThemeContext.jsx     #    theme + useTheme()  (uses useLocalStorage)
    ├── store/                   # Redux Toolkit: favorites + user recipes
    │   ├── favoritesSlice.js    #    createSlice: state + toggle/remove/clear
    │   ├── recipesSlice.js      #    🆕 user-created recipes: addRecipe / deleteRecipe
    │   └── store.js             #    configureStore (both slices) + localStorage persistence
    ├── hooks/                   # reusable logic
    │   ├── useLocalStorage.js   #    state that persists itself
    │   ├── useFavorites.js      #    Redux-backed; same shape as the old Context hook
    │   └── useFetch.js          #    data/loading/error for any async call
    ├── components/
    │   ├── Layout.jsx           # useTheme() — no props
    │   ├── Navbar.jsx           # useFavorites() (Redux) + useTheme() (Context)
    │   ├── Footer.jsx           # (unchanged)
    │   ├── ScrollToTop.jsx      # (unchanged)
    │   ├── Loader.jsx           # (unchanged)
    │   ├── RecipeCard.jsx       # 🆕 wrapped in memo(); accepts optional onView prop
    │   └── Navbar.jsx           # 🆕 also links to My Recipes + Add
    └── pages/
        ├── Home.jsx             # (useFetch refactor = homework)
        ├── Browse.jsx           # 🆕 sortedMeals via useMemo, handleView via useCallback
        ├── RecipeDetail.jsx     # useFavorites() (+ optional extractIngredients useMemo = homework)
        ├── Categories.jsx       # (unchanged)
        ├── CategoriesIndex.jsx  # (unchanged)
        ├── CategoryMeals.jsx    # useFetch() — and Save buttons now work! 🎉
        ├── Favorites.jsx        # useFavorites() + Clear-all (Redux action)
        ├── AddRecipe.jsx        # 🆕 controlled form → dispatch(addRecipe) → navigate
        ├── MyRecipes.jsx        # 🆕 useSelector(recipes) + delete
        └── NotFound.jsx         # (unchanged)

ssr-demo/                        # 🆕 standalone mini-project (NOT inside tasty/) — Part 6
├── package.json
├── Greeting.jsx                 # the component rendered on the server
└── server.jsx                   # express + renderToString(<Greeting/>)
```

> **Library note (for the instructor):** commands and APIs verified current for 2026 — `npm install @reduxjs/toolkit react-redux` (RTK 2.x / react-redux 9.x), running on the React 19 that Vite ships by default. Context, `useReducer`, custom hooks, `React.memo`, `useMemo`, and `useCallback` are all core React (the memoization trio has been stable since React 16.6/16.8) — nothing version-sensitive there. The `ssr-demo` mini-project uses `express` + `react-dom/server`'s `renderToString` (still supported in React 19; the team's current recommendation for real Node servers is the streaming `renderToPipeableStream`, mentioned in Part 6 as the production-grade next step) and `tsx` purely to run JSX files directly without a build step in class.