import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, CalendarRange, Shield, Users } from 'lucide-react';
import adminService from '../../services/adminService';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className={`rounded-2xl p-3 ${color}`}>
        <Icon size={22} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    </div>
    <p className="mt-5 text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await adminService.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-sm text-red-600">{error}</div>;
  }

  const stats = overview?.stats || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Manage users, classes, subjects, and the active academic year from one place.
          </p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          Active Year: {overview?.active_year?.name || 'Not set'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={stats.total_students || 0} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Teachers" value={stats.total_teachers || 0} icon={Shield} color="bg-violet-50 text-violet-600" />
        <StatCard label="Classes" value={stats.total_classes || 0} icon={BookOpen} color="bg-amber-50 text-amber-600" />
        <StatCard label="Assignments" value={stats.total_assignments || 0} icon={Activity} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Open user management
            </Link>
          </div>
          <div className="space-y-4">
            {(overview?.recent_users || []).map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarRange size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Academic Years</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {stats.total_years || 0} academic year records are available.
            </p>
            <Link
              to="/admin/settings"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Manage years
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Latest Teacher Assignments</h2>
            <div className="mt-4 space-y-3">
              {(overview?.recent_assignments || []).map((assignment) => (
                <div key={assignment.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-800">{assignment.class_name}</p>
                  <p className="text-sm text-slate-500">
                    {assignment.subject_name} with {assignment.teacher_name}
                  </p>
                </div>
              ))}
              {(!overview?.recent_assignments || overview.recent_assignments.length === 0) && (
                <p className="text-sm text-slate-500">No assignments have been created yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
