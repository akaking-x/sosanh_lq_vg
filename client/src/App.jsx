import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HeroListPage from './pages/HeroListPage'
import HeroDetailPage from './pages/HeroDetailPage'
import ItemListPage from './pages/ItemListPage'
import ItemDetailPage from './pages/ItemDetailPage'
import RuneListPage from './pages/RuneListPage'
import SummonerSkillPage from './pages/SummonerSkillPage'
import ComparePage from './pages/ComparePage'
import CompareDetailPage from './pages/CompareDetailPage'
import ProtectedRoute from './components/admin/ProtectedRoute'

// Admin imports
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminHeroesPage from './pages/admin/AdminHeroesPage'
import AdminItemsPage from './pages/admin/AdminItemsPage'
import AdminRunesPage from './pages/admin/AdminRunesPage'
import AdminMappingsPage from './pages/admin/AdminMappingsPage'
import AdminSkillsPage from './pages/admin/AdminSkillsPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/heroes" element={<HeroListPage />} />
        <Route path="/heroes/:slug" element={<HeroDetailPage />} />
        <Route path="/items" element={<ItemListPage />} />
        <Route path="/items/:slug" element={<ItemDetailPage />} />
        <Route path="/runes" element={<RuneListPage />} />
        <Route path="/summoner-skills" element={<SummonerSkillPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/compare/:mappingId" element={<CompareDetailPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/heroes"
          element={
            <ProtectedRoute>
              <AdminHeroesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items"
          element={
            <ProtectedRoute>
              <AdminItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/runes"
          element={
            <ProtectedRoute>
              <AdminRunesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/skills"
          element={
            <ProtectedRoute>
              <AdminSkillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mappings"
          element={
            <ProtectedRoute>
              <AdminMappingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
