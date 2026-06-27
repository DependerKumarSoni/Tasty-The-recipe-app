import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Create a channel
export const ThemeContext = createContext()

export function ThemeProvider({children}) {
    const [theme, setTheme] = useLocalStorage('theme', 'light')

    function toggleTheme() {
        setTheme((t) => (t === 'light' ? 'dark' : 'light'))
    }

    
    const value = {theme, toggleTheme}
    
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (ctx === undefined) {
        throw new Error('useTheme must be used inside a <ThemProvider>')
    }
    return ctx
}