import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import Layout from '../components/layout/Layout';
import { PagePlaceholder } from '../components/common/PagePlaceholder';
import { ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import SystemBackup from '../pages/admin/SystemBackup';
import HelpQueries from '../pages/admin/HelpQueries';
import TimetableManagement from '../pages/admin/TimetableManagement';
import TimetableManager from '../pages/admin/TimetableManager';
import UserManagement from '../pages/admin/UserManagement';
import HelpCenter from '../pages/common/HelpCenter';
import Notifications from '../pages/common/Notifications';
import Profile from '../pages/common/Profile';
import NotFound from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';
import Assignments from '../pages/student/Assignments';
import Dashboard from '../pages/student/Dashboard';
import Messaging from '../pages/student/Messaging';
import MyGrades from '../pages/student/MyGrades';
import MyLearning from '../pages/student/MyLearning';
import LiveClassJoin from '../pages/student/LiveClassJoin';
import StudentQuizzes from '../pages/student/Quizzes';
import CourseViewer from '../pages/student/CourseViewer';
import CourseContentEditor from '../pages/teacher/CourseContentEditor';
import TeacherAssignments from '../pages/teacher/AssignmentCreate';
import TeacherQuizzes from '../pages/teacher/Quizzes';
import ForumManage from '../pages/teacher/ForumManage';
import GradingView from '../pages/teacher/GradingView';
import TeacherMessaging from '../pages/teacher/Messaging';
import TeacherLiveClass from '../pages/teacher/LiveClass';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import ForumView from '../pages/student/ForumView';

const RoleDashboard = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.ADMIN) return <AdminDashboard />;
  if (user?.role === ROLES.TEACHER) return <TeacherDashboard />;
  return <Dashboard />;
};

const ComingSoonPage = () => (
  <PagePlaceholder
    variant="comingSoon"
    title="Coming Soon"
    description="This page is still under construction."
    action={false}
    secondaryAction={false}
  />
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<RoleDashboard />} />

      <Route
        path="admin/users"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/courses"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <TimetableManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/timetable"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <TimetableManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/settings"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <SystemBackup />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/help-queries"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <HelpQueries />
          </ProtectedRoute>
        }
      />

      <Route
        path="teacher/courses"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/assignments"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/quizzes"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/live-classes"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherLiveClass />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/grading"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <GradingView />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/forum"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <ForumManage />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/messages"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherMessaging />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/course/:courseId/edit"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <CourseContentEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/course/:courseId/preview"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <CourseViewer />
          </ProtectedRoute>
        }
      />

      <Route
        path="student/courses"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <MyLearning />
          </ProtectedRoute>
        }
      />
      <Route
        path="student/course/:courseId"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <CourseViewer />
          </ProtectedRoute>
        }
      />
      <Route
        path="student/assignments"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Assignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="student/quizzes"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="student/live-classes"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <LiveClassJoin />
          </ProtectedRoute>
        }
      />
      <Route
        path="student/grades"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <MyGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path="student/messages"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Messaging />
          </ProtectedRoute>
        }
      />
      <Route
        path="student/forum"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <ForumView />
          </ProtectedRoute>
        }
      />

      <Route path="profile" element={<Profile />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="help" element={<HelpCenter />} />
      <Route path="settings" element={<ComingSoonPage />} />
      <Route path="unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<ComingSoonPage />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
