import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Layout from './components/Layout'
import RecipeDetail from './pages/RecipeDetail'
import Categories from './pages/Categories'
import CategoriesIndex from './pages/CategoriesIndex'
import CategoryMeals from './pages/CategoryMeals'
import Favorites from './pages/Favorites'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='browse' element={<Browse />} />
          <Route path='recipe/:id' element={<RecipeDetail />} />
          <Route path='categories' element={<Categories />}>
            <Route index element={<CategoriesIndex/>} /> 
            <Route path=':categoryName' element={<CategoryMeals />} />
          </Route>
          <Route path='favorites' element={<Favorites />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
