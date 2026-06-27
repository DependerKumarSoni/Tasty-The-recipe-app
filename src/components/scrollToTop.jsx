import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        // Prevent the browser from restoring the previous scroll position
        // on back/forward navigation — we always want to start at the top.
        history.scrollRestoration = 'manual'
    }, [])

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

export default ScrollToTop