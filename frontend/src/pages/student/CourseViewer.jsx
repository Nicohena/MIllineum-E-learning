import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, BookOpen, FileText, Download, 
  ExternalLink, CheckCircle, Info, ChevronRight,
  Menu, X, Loader2, ArrowLeft, PlayCircle
} from 'lucide-react';
import studentService from '../../services/studentService';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // notes, materials, reference
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isTeacherPreview = location.pathname.startsWith('/teacher/course/');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await studentService.getCourseContent(courseId);
        setChapters(data.chapters || []);
        if (data.chapters && data.chapters.length > 0) {
          setActiveChapter(data.chapters[0]);
        }
      } catch (error) {
        console.error("Failed to load course content", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [courseId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
          </div>
          <p className="font-black text-slate-800 tracking-tight">Opening Course Reader...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`
        ${sidebarOpen ? 'w-80' : 'w-0'} 
        transition-all duration-500 border-r border-slate-100 bg-slate-50/30 flex flex-col relative
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => navigate(isTeacherPreview ? `/teacher/course/${courseId}/edit` : '/student/courses')}
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Curriculum Chapters</p>
          {chapters.map((chapter, idx) => (
            <button
              key={chapter.id}
              onClick={() => setActiveChapter(chapter)}
              className={`
                w-full text-left p-4 rounded-2xl transition-all flex items-start gap-3 group
                ${activeChapter?.id === chapter.id 
                  ? 'bg-white shadow-xl shadow-indigo-500/5 border border-indigo-100' 
                  : 'hover:bg-white/80'}
              `}
            >
              <div className={`
                shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm
                ${activeChapter?.id === chapter.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                {idx + 1}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${activeChapter?.id === chapter.id ? 'text-slate-900' : 'text-slate-500'}`}>
                  {chapter.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {chapter.notes.length} notes • {chapter.learning_materials.length + chapter.reference_materials.length} resources
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 bg-slate-900 text-white m-4 rounded-3xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Info size={40} /></div>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Need Help?</p>
          <p className="text-sm font-medium leading-relaxed">If you have questions about this chapter, reach out to your teacher.</p>
          <button className="text-xs font-black text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all">
            Open Chat
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top bar */}
        <header className="h-20 border-b border-slate-50 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
            <h2 className="text-lg font-black text-slate-900 truncate max-w-md">
              {activeChapter?.title || 'Course Content'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl">
              {[
                { id: 'notes', icon: FileText, label: 'Notes' },
                { id: 'materials', icon: BookOpen, label: 'Materials' },
                { id: 'reference', icon: ExternalLink, label: 'Reference' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all
                    ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  <tab.icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Reader Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto py-12 px-8">
            
            {activeTab === 'notes' && (
              <div className="space-y-10">
                {activeChapter?.notes.length > 0 ? (
                  activeChapter.notes.map((note, idx) => (
                    <article key={idx} className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 prose prose-slate prose-indigo max-w-none">
                      <div className="flex items-center gap-3 mb-8 not-prose">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Section {idx + 1}</p>
                          <p className="text-xs font-bold text-slate-500">Official Lecture Notes</p>
                          {note.author_name && (
                            <p className="text-[12px] text-slate-400 font-medium mt-1">Published by {note.author_name}</p>
                          )}
                        </div>
                      </div>
                      <div 
                        dangerouslySetInnerHTML={{ __html: note.content }} 
                        className="text-slate-700 leading-relaxed text-lg font-medium selection:bg-indigo-100"
                      />
                    </article>
                  ))
                ) : (
                  <EmptyState icon={FileText} title="No notes published" description="Your teacher hasn't published any lecture notes for this chapter yet." />
                )}
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeChapter?.learning_materials.length > 0 ? (
                  activeChapter.learning_materials.map((mat, idx) => (
                    <MaterialCard key={idx} material={mat} />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState icon={BookOpen} title="No materials available" description="Supplementary learning materials like PDFs and slides will appear here." />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reference' && (
              <div className="space-y-4">
                {activeChapter?.reference_materials.length > 0 ? (
                  activeChapter.reference_materials.map((ref, idx) => (
                    <a 
                      key={idx} 
                      href={ref.url_or_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                          <ExternalLink size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{ref.title}</p>
                          <p className="text-xs text-slate-400 font-medium">External Reference Resource</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </a>
                  ))
                ) : (
                  <EmptyState icon={ExternalLink} title="No references added" description="External links, videos, and research papers will be listed here." />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const MaterialCard = ({ material }) => (
  <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 flex flex-col h-full hover:shadow-xl transition-all group">
    <div className="flex items-start justify-between mb-6">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
        {material.file_type === 'PDF' ? <FileText size={28} /> : <PlayCircle size={28} />}
      </div>
      <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
        {material.file_type || 'DOC'}
      </span>
    </div>
    <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">{material.title}</h4>
    <p className="text-sm text-slate-500 line-clamp-2 mb-8 flex-1">{material.description || 'Supplementary resource for deeper understanding.'}</p>
    <a 
      href={material.file_url} 
      target="_blank" 
      rel="noreferrer"
      className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-slate-100"
    >
      <Download size={16} /> DOWNLOAD RESOURCE
    </a>
  </div>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-20 px-6">
    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
      <Icon size={40} />
    </div>
    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">{description}</p>
  </div>
);

export default CourseViewer;
