// pages/student/ForumViewEnhanced.jsx (future implementation)
import { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Pin, 
  CheckCircle, 
  ThumbsUp, 
  MessageCircle,
  Plus,
  Users,
  TrendingUp,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const ForumView= () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Discussions', count: 654, icon: MessageSquare },
    { id: 'my-courses', name: 'My Courses', count: 12, icon: Users },
    { id: 'pinned', name: 'Pinned', count: 3, icon: Pin },
    { id: 'unanswered', name: 'Unanswered', count: 8, icon: MessageCircle },
  ];
  
  const threads = [
    {
      id: 1,
      title: 'Understanding React Hooks - Best Practices',
      author: 'Prof. Sarah Johnson',
      authorRole: 'teacher',
      course: 'Advanced React Development',
      replies: 15,
      views: 234,
      upvotes: 45,
      isPinned: true,
      isVerified: true,
      lastActivity: '2 hours ago',
      tags: ['react', 'hooks', 'javascript']
    },
    // ... more threads
  ];
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Discussion Forum</h1>
          <p className="text-slate-500 mt-1">Connect, learn, and grow with your peers</p>
        </div>
        <Button leftIcon={<Plus size={18} />} variant="primary">
          New Discussion
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="white" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Discussions</p>
              <p className="text-2xl font-bold text-slate-800">1,247</p>
            </div>
            <MessageSquare size={32} className="text-indigo-400" />
          </div>
        </Card>
        <Card variant="white" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Users</p>
              <p className="text-2xl font-bold text-slate-800">342</p>
            </div>
            <Users size={32} className="text-emerald-400" />
          </div>
        </Card>
        <Card variant="white" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Teacher Answers</p>
              <p className="text-2xl font-bold text-slate-800">89</p>
            </div>
            <Award size={32} className="text-amber-400" />
          </div>
        </Card>
        <Card variant="white" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Today&apos;s Activity</p>
              <p className="text-2xl font-bold text-slate-800">156</p>
            </div>
            <TrendingUp size={32} className="text-purple-400" />
          </div>
        </Card>
      </div>
      
      {/* Search and Filters */}
      <Card variant="glass" padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
                <span className="ml-1 text-xs opacity-75">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Threads List */}
      <div className="space-y-3">
        {threads.map((thread) => (
          <div key={thread.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {thread.isPinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Pin size={12} />
                      Pinned
                    </span>
                  )}
                  {thread.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} />
                      Verified Answer
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    thread.authorRole === 'teacher' 
                      ? 'bg-purple-50 text-purple-600' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {thread.authorRole === 'teacher' ? 'Teacher' : 'Student'}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {thread.title}
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  by {thread.author} • {thread.course}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    {thread.replies} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={12} />
                    {thread.upvotes} upvotes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {thread.lastActivity}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-3">
                  {thread.tags.map(tag => (
                    <span key={tag} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <ChevronRight size={20} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumView;