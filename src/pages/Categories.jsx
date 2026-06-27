import { useState, useEffect } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { getCategories } from "../api/mealApi"

function Categories() {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    // useEffect(() => {
    //     console.log("🔥Categories (state): ", categories);
    // }, [categories])


    return (
        <div className="categories">
            <style>{`
                .categories { padding: 24px; }
                .categories .chips { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0 8px; }
                .categories .chip {
                padding: 8px 14px; border-radius: 999px; text-decoration: none;
                background: #fff; border: 1px solid #cbd2d9; color: #1f2933; font-weight: 600; font-size: 14px;
                }
                .categories .chip:hover { border-color: #ef6c4d; }
                .categories .chip.active { background: #ef6c4d; color: #fff; border-color: #ef6c4d; }
                .categories .outlet-area { margin-top: 18px; }
            `}</style>
            <h1>Categories</h1>
            <div className="chips">
                {categories.map((c) => (
                    <NavLink
                        key={c.idCategory}
                        to={`/categories/${c.strCategory}`}
                        className={({ isActive }) => (isActive ? 'chip active' : 'chip')}
                    >{c.strCategory}</NavLink>
                ))}
            </div>
            <div className="outlet-area">
                <Outlet />
            </div>
        </div>
    )
}

export default Categories