import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './layouts/PublicLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectFormPage from './pages/ProjectFormPage';
import GenericRegisterPage from './pages/GenericRegisterPage';
import SlaListPage from './pages/SlaListPage';
import SlaDetailPage from './pages/SlaDetailPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard Routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProtectedRoute><ProjectFormPage /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={<ProtectedRoute><ProjectFormPage /></ProtectedRoute>} />

        {/* Registers */}
        <Route path="/contracts" element={<GenericRegisterPage registerType="contracts" />} />
        <Route path="/progress" element={<GenericRegisterPage registerType="progress" />} />
        <Route path="/milestones" element={<GenericRegisterPage registerType="milestones" />} />
        <Route path="/deliverables" element={<GenericRegisterPage registerType="deliverables" />} />
        <Route path="/financials" element={<GenericRegisterPage registerType="financials" />} />
        <Route path="/resources" element={<GenericRegisterPage registerType="resources" />} />
        <Route path="/risks" element={<GenericRegisterPage registerType="risks" />} />
        <Route path="/issues" element={<GenericRegisterPage registerType="issues" />} />
        <Route path="/interventions" element={<GenericRegisterPage registerType="interventions" />} />
        <Route path="/recovery" element={<GenericRegisterPage registerType="recovery" />} />
        <Route path="/forward-look" element={<GenericRegisterPage registerType="forward-look" />} />
        <Route path="/users" element={<ProtectedRoute><GenericRegisterPage registerType="users" /></ProtectedRoute>} />
        <Route path="/insurances" element={<GenericRegisterPage registerType="insurances" />} />
        <Route path="/slas" element={<SlaListPage />} />
        <Route path="/slas/:id" element={<SlaDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
