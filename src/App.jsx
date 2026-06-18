import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FeedbackButton from './components/FeedbackButton.jsx'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const BrowseGenrePage = lazy(() => import('./pages/BrowseGenrePage.jsx'))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage.jsx'))
const DetailPage = lazy(() => import('./pages/DetailPage.jsx'))
const WatchPage = lazy(() => import('./pages/WatchPage.jsx'))
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'))
const FilmDetailPage = lazy(() => import('./pages/FilmDetailPage.jsx'))
const FilmWatchPage = lazy(() => import('./pages/FilmWatchPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

function PageLoader() {
  return (
    <div style={{
      alignItems: 'center',
      backgroundColor: '#141414',
      display: 'flex',
      justifyContent: 'center',
      minHeight: '100vh',
    }}>
      <div style={{
        animation: 'pulse 1.5s ease-in-out infinite',
        backgroundColor: '#7C3AED',
        borderRadius: '4px',
        height: '32px',
        width: '4px',
      }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseGenrePage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/watch/:id/:episode" element={<WatchPage />} />
          <Route path="/film/:detailPath" element={<FilmDetailPage />} />
          <Route path="/film-watch/:detailPath" element={<FilmWatchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <FeedbackButton />
      </Suspense>
    </BrowserRouter>
  )
}
