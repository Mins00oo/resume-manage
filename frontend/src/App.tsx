import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './routes/LoginPage';
import OAuthCallbackPage from './routes/OAuthCallbackPage';
import HomePage from './routes/HomePage';
import JobApplyListPage from './routes/JobApplyListPage';
import JobApplyCreatePage from './routes/JobApplyCreatePage';
import JobApplyDetailPage from './routes/JobApplyDetailPage';
import ResumesListPage from './routes/ResumesListPage';
import ResumeEditorPage from './routes/ResumeEditorPage';
import CalendarPage from './routes/CalendarPage';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/applies" element={<JobApplyListPage />} />
          <Route path="/applies/new" element={<JobApplyCreatePage />} />
          <Route path="/applies/:id" element={<JobApplyDetailPage />} />
          <Route path="/resumes" element={<ResumesListPage />} />
          <Route path="/resumes/new" element={<ResumeEditorPage />} />
          <Route path="/resumes/:id" element={<ResumeEditorPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
