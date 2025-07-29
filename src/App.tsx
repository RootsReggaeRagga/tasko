import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { MainLayout } from '@/components/layout/main-layout';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import NewTask from '@/pages/NewTask';
import EditTask from '@/pages/EditTask';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import TaskDetail from '@/pages/TaskDetail';
import Teams from '@/pages/Teams';
import NewTeam from '@/pages/NewTeam';
import TeamDetail from '@/pages/TeamDetail';
import TeamInvite from '@/pages/TeamInvite';
import AcceptInvitation from '@/pages/AcceptInvitation';
import Projects from '@/pages/Projects';
import ProjectInvite from '@/pages/ProjectInvite';
import Clients from '@/pages/Clients';
import Reports from '@/pages/Reports';
import NewProject from '@/pages/NewProject';
import ProjectDetail from '@/pages/ProjectDetail';
import ProjectBoard from '@/pages/ProjectBoard';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const AppContent = () => {
  useTheme(); // Initialize theme

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
                      <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite/:token" element={<AcceptInvitation />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="tasks/:id/edit" element={<EditTask />} />
              <Route path="new-task" element={<NewTask />} />
              <Route path="teams" element={<Teams />} />
              <Route path="teams/:id" element={<TeamDetail />} />
              <Route path="teams/:id/invite" element={<TeamInvite />} />
              <Route path="new-team" element={<NewTeam />} />
                          <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="projects/:projectId/board" element={<ProjectBoard />} />
            <Route path="projects/:projectId/invite" element={<ProjectInvite />} />
              <Route path="clients" element={<Clients />} />
              <Route path="reports" element={<Reports />} />
              <Route path="new-project" element={<NewProject />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

export default App;