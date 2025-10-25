import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AdminAnnouncementsPage from './pages/AdminAnnouncementsPage'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/announcements/admin" element={<AdminAnnouncementsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
