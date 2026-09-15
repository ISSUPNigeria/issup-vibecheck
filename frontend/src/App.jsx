import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Screening from './pages/Screening'
import Results from './pages/Results'
import Chat from './pages/Chat'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import Screenings from './pages/admin/Screenings'
import Demographics from './pages/admin/Demographics'
import Users from './pages/admin/Users'
import ChatAnalytics from './pages/admin/ChatAnalytics'
import TokenUsage from './pages/admin/TokenUsage'
import CrisisLog from './pages/admin/CrisisLog'
import Feedback from './pages/admin/Feedback'
import ShareApp from './pages/admin/ShareApp'
import Suggestions from './pages/admin/Suggestions'
import GamblingAnalytics from './pages/admin/GamblingAnalytics'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Main app */}
        <Route path="/" element={<div className="min-h-screen bg-white"><Home /></div>} />
        <Route path="/screening" element={<div className="min-h-screen bg-white"><Screening /></div>} />
        <Route path="/results" element={<div className="min-h-screen bg-white"><Results /></div>} />
        <Route path="/chat" element={<div className="min-h-screen bg-white"><Chat /></div>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="screenings" element={<Screenings />} />
          <Route path="demographics" element={<Demographics />} />
          <Route path="users" element={<Users />} />
          <Route path="chat" element={<ChatAnalytics />} />
          <Route path="tokens" element={<TokenUsage />} />
          <Route path="crisis" element={<CrisisLog />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="gambling" element={<GamblingAnalytics />} />
          <Route path="share" element={<ShareApp />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
