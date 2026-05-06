import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Pin, 
  CheckCircle, 
  MessageCircle,
  Plus,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowLeft,
  Send,
  Loader2,
  BookOpen,
  Settings,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import forumService from '../../services/forumService';
import { useAuth } from '../../context/AuthContext';

const ForumManage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [newThreadModal, setNewThreadModal] = useState(false);
  const [newReplyContent, setNewReplyContent] = useState('');
  
  // New thread form state
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  const iconMap = {
    MessageSquare,
    BookOpen,
    Settings,
    Users
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [cats, initialThreads] = await Promise.all([
        forumService.getCategories(),
        forumService.getThreads()
      ]);
      setCategories(cats);
      setThreads(initialThreads);
    } catch (error) {
      console.error("Failed to fetch forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (catId) => {
    setSelectedCategory(catId);
    setSelectedThread(null);
    setLoading(true);
    try {
      const filteredThreads = await forumService.getThreads(catId, searchTerm);
      setThreads(filteredThreads);
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filteredThreads = await forumService.getThreads(selectedCategory, searchTerm);
      setThreads(filteredThreads);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = async (threadId) => {
    setLoading(true);
    try {
      const threadData = await forumService.getThread(threadId);
      setSelectedThread(threadData);
    } catch (error) {
      console.error("Failed to fetch thread details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      await forumService.createThread({
        category_id: newThreadCategory,
        title: newThreadTitle,
        content: newThreadContent
      });
      setNewThreadModal(false);
      setNewThreadTitle('');
      setNewThreadContent('');
      fetchInitialData();
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!newReplyContent.trim()) return;
    try {
      await forumService.addReply({
        thread_id: selectedThread.id,
        content: newReplyContent
      });
      setNewReplyContent('');
      const updatedThread = await forumService.getThread(selectedThread.id);
      setSelectedThread(updatedThread);
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const handleTogglePin = async (threadId) => {
    try {
      await forumService.togglePin(threadId);
      if (selectedThread?.id === threadId) {
        const updatedThread = await forumService.getThread(threadId);
        setSelectedThread(updatedThread);
      }
      fetchInitialData();
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  if (loading && !selectedThread && !threads.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forum Management</h1>
          <p className="text-slate-500 font-medium">Moderate discussions, pin important topics, and engage with students.</p>
        </div>
        <Button 
          leftIcon={<Plus size={18} />} 
          variant="primary"
          onClick={() => setNewThreadModal(true)}
          className="rounded-2xl shadow-lg shadow-indigo-100"
        >
          New Announcement
        </Button>
      </div>
      
      {/* Search and Filters */}
      <Card variant="white" padding="md" className="rounded-[2rem] border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-sm transition-all"
            />
          </form>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => {
              const Icon = iconMap[cat.icon] || MessageSquare;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
      
      {selectedThread ? (
        /* Thread View */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setSelectedThread(null)}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Discussions
          </button>
          
          <Card padding="lg" className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {selectedThread.category_name}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedThread.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500">
                      {selectedThread.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{selectedThread.author_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {selectedThread.author_role} • {new Date(selectedThread.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleTogglePin(selectedThread.id)}
                    className={`p-2.5 rounded-xl transition-all ${
                      selectedThread.is_pinned 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                    title={selectedThread.is_pinned ? "Unpin Topic" : "Pin Topic"}
                  >
                    <Pin size={20} fill={selectedThread.is_pinned ? "currentColor" : "none"} />
                  </button>
                  <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-3xl">
                {selectedThread.content}
              </div>
              
              <div className="pt-6 border-t border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900">Replies ({selectedThread.replies.length})</h3>
                <div className="space-y-4">
                  {selectedThread.replies.map(reply => (
                    <div key={reply.id} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-indigo-500 text-xs shrink-0">
                        {reply.author_name.charAt(0)}
                      </div>
                      <div className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl group-hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black text-slate-800">{reply.author_name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(reply.created_at).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{reply.content}</p>
                        {user.role === 'teacher' && (
                          <div className="mt-3 flex items-center gap-2">
                            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors">
                              Verify Answer
                            </button>
                            <button className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md hover:bg-red-100 transition-colors">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Reply Form */}
                <form onSubmit={handleAddReply} className="flex items-start gap-4 pt-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      placeholder="Write your response..."
                      value={newReplyContent}
                      onChange={(e) => setNewReplyContent(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none resize-none h-24"
                    />
                    <button 
                      type="submit"
                      className="absolute bottom-4 right-4 p-2 bg-indigo-600 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-indigo-100"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Threads List */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {threads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <MessageSquare className="mx-auto mb-4 text-slate-200" size={64} />
                <h3 className="text-xl font-black text-slate-800">No discussions yet</h3>
                <p className="text-slate-400 font-medium">Create an announcement to engage your students.</p>
              </div>
            ) : (
              threads.map((thread) => (
                <div 
                  key={thread.id} 
                  className="bg-white rounded-3xl border border-slate-50 p-6 hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all cursor-pointer group animate-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-start justify-between">
                    <div onClick={() => handleThreadClick(thread.id)} className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.is_pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            <Pin size={12} fill="currentColor" />
                            PINNED
                          </span>
                        )}
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                          {thread.category_name}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {thread.title}
                      </h3>
                      
                      <p className="text-sm text-slate-500 font-medium line-clamp-2">
                        {thread.content}
                      </p>
                      
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                            {thread.author_name.charAt(0)}
                          </div>
                          <span className="text-xs font-black text-slate-800">{thread.author_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <MessageCircle size={14} className="text-indigo-400" />
                            {thread.reply_count} replies
                          </span>
                          <span className="flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-emerald-400" />
                            {thread.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleTogglePin(thread.id)}
                        className={`p-2 rounded-lg transition-all ${
                          thread.is_pinned ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Pin size={18} fill={thread.is_pinned ? "currentColor" : "none"} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Sidebar Management */}
          <div className="space-y-6">
            <Card variant="indigo" padding="lg" className="rounded-[2.5rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Teacher Insights</p>
                    <h3 className="text-2xl font-black mt-1">Forum Health</h3>
                  </div>
                  <TrendingUp size={32} className="text-white/10" />
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black">{threads.length}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Topics</p>
                    </div>
                    <MessageSquare className="text-indigo-400" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black">84%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Response Rate</p>
                    </div>
                    <CheckCircle className="text-emerald-400" />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card padding="md" className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-100/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Moderation Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-slate-400 group-hover:text-indigo-600" />
                    <span className="text-sm font-bold text-slate-600">Locked Topics</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Pin size={16} className="text-slate-400 group-hover:text-amber-600" />
                    <span className="text-sm font-bold text-slate-600">Pinned Announcements</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-slate-400 group-hover:text-indigo-600" />
                    <span className="text-sm font-bold text-slate-600">Reported Content</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* New Thread Modal */}
      {newThreadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card padding="lg" className="w-full max-w-xl rounded-[2.5rem] shadow-2xl border-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">New Announcement</h2>
                <button onClick={() => setNewThreadModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreateThread} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Topic Title</label>
                  <input
                    required
                    type="text"
                    placeholder="E.g., Important Exam Guidelines"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-slate-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    required
                    value={newThreadCategory}
                    onChange={(e) => setNewThreadCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-slate-800 appearance-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Content</label>
                  <textarea
                    required
                    placeholder="Write your announcement content here..."
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-600 resize-none h-40"
                  />
                </div>
                
                <div className="flex gap-4 pt-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    fullWidth
                    onClick={() => setNewThreadModal(false)}
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary" 
                    fullWidth
                    className="rounded-2xl shadow-lg shadow-indigo-100"
                  >
                    Publish Announcement
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ForumManage;
