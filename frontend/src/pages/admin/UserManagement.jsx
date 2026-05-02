import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Mail, 
  KeyRound,
  ShieldCheck, 
  Ban, 
  Trash2, 
  Loader2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import userService from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    grade: '',
    teaching_subject: ''
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, debouncedSearch, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({
        role: roleFilter === 'all' ? null : roleFilter,
        search: debouncedSearch || null,
        page: currentPage,
        perPage,
      });
      const pagination = data.pagination || {};
      setUsers(data.users || []);
      setTotalUsers(pagination.total || 0);
      setTotalPages(Math.max(1, pagination.total_pages || 1));

      if (pagination.total_pages && currentPage > pagination.total_pages) {
        setCurrentPage(pagination.total_pages);
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    const createdRole = newUserData.role;
    try {
      const response = await userService.createUser(newUserData);
      setShowCreateModal(false);
      setNewUserData({
        name: '',
        email: '',
        role: 'student',
        password: '',
        grade: '',
        teaching_subject: ''
      });
      const successMessage = response?.student_identifier
        ? `User created successfully. Student ID: ${response.student_identifier}`
        : 'User created successfully.';
      setFeedback({ type: 'success', message: successMessage });

      if (roleFilter !== 'all' && roleFilter !== createdRole) {
        setRoleFilter('all');
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Failed to create user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await userService.updateStatus(userId, newStatus);
      setFeedback({ type: 'success', message: `User status updated to ${newStatus}.` });
      fetchUsers();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to update status.' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await userService.deleteUser(userId);
      setFeedback({ type: 'success', message: 'User deleted successfully.' });
      fetchUsers();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to delete user.' });
    }
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setResetPasswordData({ password: '', confirmPassword: '' });
    setShowResetModal(true);
    setFeedback({ type: '', message: '' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetPasswordData.password.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await userService.resetPassword(selectedUser.id, resetPasswordData.password);
      setShowResetModal(false);
      setSelectedUser(null);
      setResetPasswordData({ password: '', confirmPassword: '' });
      setFeedback({ type: 'success', message: 'Password reset successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.error || 'Failed to reset password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
      case 'suspended': return 'bg-red-50 text-red-600 ring-red-100';
      case 'inactive': return 'bg-slate-100 text-slate-500 ring-slate-200';
      default: return 'bg-slate-100 text-slate-500 ring-slate-200';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor all platform accounts from a single interface.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all flex items-center gap-2 w-max shadow-xl shadow-primary-200 active:scale-95"
        >
          <UserPlus size={20} />
          Create New User
        </button>
      </div>

      {feedback.message && (
        <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold ${
          feedback.type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-100'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        }`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all text-sm outline-none font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-slate-400 hidden md:block" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:w-48 bg-slate-50 border-transparent rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Level</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-primary-600" size={40} />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing user database...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${
                          user.role === 'admin' ? 'bg-primary-100 text-primary-700' :
                          user.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-base">{user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-colors ${
                        user.role === 'admin' ? 'border-primary-100 text-primary-600 bg-primary-50' : 
                        user.role === 'teacher' ? 'border-indigo-100 text-indigo-600 bg-indigo-50' : 
                        'border-slate-100 text-slate-500 bg-slate-50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {user.role === 'student' ? (
                        <div>
                          <p className="text-xs font-extrabold text-slate-700">{user.student_identifier || 'Pending ID'}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.grade || 'Grade not set'}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">N/A</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ring-1 ${getStatusColor(user.status || 'active')}`}>
                        {(user.status || 'ACTIVE').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-bold">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button
                           onClick={() => openResetModal(user)}
                           className="p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl text-amber-600 shadow-sm border border-slate-100 transition-all"
                           title="Reset Password"
                         >
                            <KeyRound size={18} />
                         </button>
                         <button 
                           onClick={() => handleUpdateStatus(user.id, user.status === 'suspended' ? 'active' : 'suspended')}
                           className={`p-2.5 rounded-xl shadow-sm border border-slate-100 transition-all ${
                             user.status === 'suspended' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                           }`}
                           title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                         >
                            {user.status === 'suspended' ? <ShieldCheck size={18} /> : <Ban size={18} />}
                         </button>
                         <button 
                           onClick={() => handleDeleteUser(user.id)}
                           className="p-2.5 bg-white hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 shadow-sm border border-slate-100 transition-all"
                           title="Delete User"
                         >
                            <Trash2 size={18} />
                         </button>
                         <button className="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-400 shadow-sm border border-slate-100 transition-all ml-2">
                            <MoreHorizontal size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Showing {users.length} of {totalUsers} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage <= 1 || loading}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-600">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || loading}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900">Create New User</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Register a new student, teacher, or administrator.</p>
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <input 
                         required
                         type="text" 
                         className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700"
                         placeholder="John Doe"
                         value={newUserData.name}
                         onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                       <select 
                         className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                         value={newUserData.role}
                         onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                       >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Administrator</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700"
                      placeholder="john@school.com"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                    <input 
                      required
                      type="password" 
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700"
                      placeholder="••••••••"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    />
                 </div>

                 {newUserData.role === 'student' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                       <select
                         className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700"
                         value={newUserData.grade}
                         onChange={(e) => setNewUserData({...newUserData, grade: e.target.value})}
                       >
                         <option value="">Select grade</option>
                         <option value="Grade 9">Grade 9</option>
                         <option value="Grade 10">Grade 10</option>
                         <option value="Grade 11">Grade 11</option>
                         <option value="Grade 12">Grade 12</option>
                       </select>
                    </div>
                 )}

                 {newUserData.role === 'teacher' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teaching Subject</label>
                       <input 
                         type="text" 
                         className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700"
                         placeholder="e.g. Mathematics"
                         value={newUserData.teaching_subject}
                         onChange={(e) => setNewUserData({...newUserData, teaching_subject: e.target.value})}
                       />
                    </div>
                 )}

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                    >
                       Discard
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-2 py-4 px-10 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                       {isSubmitting ? 'Creating...' : 'Finalize Registration'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Reset Password</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Set a new password for {selectedUser.name}.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <input
                  required
                  type="password"
                  className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700"
                  placeholder="••••••••"
                  value={resetPasswordData.password}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <input
                  required
                  type="password"
                  className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold text-slate-700"
                  placeholder="••••••••"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 py-4 px-10 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-all shadow-xl shadow-amber-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
