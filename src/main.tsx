import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initTheme } from '@b1nd/dodam-design-system/themes'
import '@b1nd/dodam-design-system/colors/colors.css'
import App from "./App.tsx"

initTheme();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)