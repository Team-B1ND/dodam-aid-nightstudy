import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initTheme } from '@b1nd/dodam-design-system/themes'
import '@b1nd/dodam-design-system/colors/colors.css'
import App from "./App.tsx"

// 잡히지 않은 비동기 에러를 콘솔에 남긴다 (라이브러리 내부 에러 추적용)
window.addEventListener('unhandledrejection', (e) => {
    console.error('unhandledrejection:', e.reason)
})

initTheme();

// 도담 앱이 WebView URL 쿼리로 넘겨주는 access token 수신
const token = new URLSearchParams(location.search).get('token')
if (token) {
    localStorage.setItem('access_token', token)
    const url = new URL(location.href)
    url.searchParams.delete('token')
    history.replaceState(null, '', url.toString())
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)