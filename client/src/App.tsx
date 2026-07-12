import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Layout } from './components/layout'
import { LandingPage } from './pages/landing'
import { LoginPage } from './pages/login'
import { RegisterPage } from './pages/register'
import { DashboardPage } from './pages/dashboard'
import { EditorPage } from './pages/editor'
import { TemplatesPage } from './pages/templates'
import { ProfilePage } from './pages/profile'
import { PublicInvitationPage } from './pages/public-invitation'
import { GuestsPage } from './pages/guests'
import { AdminPage } from './pages/admin'
import { TemplateDemoPage } from './pages/template-demo'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/invitations/:id/guests" element={<GuestsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/template-demo/:id" element={<TemplateDemoPage />} />
        <Route path="/inv/:slug" element={<PublicInvitationPage />} />
      </Routes>
    </AuthProvider>
  )
}
