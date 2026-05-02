import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  FileUp, 
  ChevronRight, 
  BookOpen,
  ArrowLeft,
  MoreVertical,
  Save,
  Trash2,
  ExternalLink,
  Loader2,
  Cloud
} from 'lucide-react';
import contentService from '../../services/contentService';

const CourseContentEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishLoading, setPublishLoading] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  
  // State for adding content
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState('learning'); // learning or reference
  const [materialFile, setMaterialFile] = useState(null);
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialError, setMaterialError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    setLoading(true);
    try {
      const data = await contentService.getCourseContent(courseId);
      setCourseData(data);
      if (data.chapters && data.chapters.length > 0 && !activeChapterId) {
        setActiveChapterId(data.chapters[0].id);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      await contentService.createChapter(courseId, newChapterTitle);
      setNewChapterTitle('');
      setShowAddChapter(false);
      fetchCourseContent();
    } catch (error) {
      alert('Failed to create chapter');
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !activeChapterId) return;
    try {
      await contentService.addNote(activeChapterId, noteContent);
      setNoteContent('');
      setShowAddNote(false);
      fetchCourseContent();
    } catch (error) {
      alert('Failed to add note');
    }
  };

  const handleAddMaterial = async () => {
    if (!materialTitle.trim() || !activeChapterId) {
      setMaterialError('Resource title is required.');
      return;
    }

    if (materialType === 'learning' && !materialFile) {
      setMaterialError('Please choose a file before adding the resource.');
      return;
    }

    if (materialType === 'reference' && !materialUrl.trim()) {
      setMaterialError('Please enter a resource URL before adding the resource.');
      return;
    }

    try {
      setMaterialError('');
      setIsUploading(true);
      const materialData = {
        type: materialType,
        file: materialFile,
        url: materialUrl.trim(),
        description: ''
      };
      await contentService.addMaterial(activeChapterId, materialTitle, materialData);
      setMaterialTitle('');
      setMaterialFile(null);
      setMaterialUrl('');
      setMaterialType('learning');
      setShowAddMaterial(false);
      fetchCourseContent();
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to add resource. Please check your Cloudinary settings.';
      setMaterialError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishAll = async () => {
    if (!window.confirm('Publish all course content?')) return;
    try {
      setPublishLoading(true);
      await contentService.publishCourseContent(courseId);
      alert('Course content published successfully');
      fetchCourseContent();
    } catch (error) {
      console.error('Publish failed:', error);
      const msg = error?.response?.data?.error || 'Failed to publish course content.';
      alert(msg);
    } finally {
      setPublishLoading(false);
    }
  };

  const activeChapter = courseData?.chapters?.find(c => c.id === activeChapterId);

  if (loading && !courseData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Content Builder</h1>
            <p className="text-xs text-slate-500 font-medium">Course ID: {courseId}</p>
          </div>
        </div>
          <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/teacher/course/${courseId}/preview`)}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Preview as Student
          </button>
          <button
            onClick={handlePublishAll}
            disabled={publishLoading}
            className="px-4 py-2 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200 disabled:opacity-60"
          >
            {publishLoading ? 'Publishing…' : 'Publish All'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Chapters */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-primary-600" />
              Curriculum
            </h2>
            <button 
              onClick={() => setShowAddChapter(true)}
              className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {showAddChapter && (
              <div className="p-3 bg-slate-50 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2">
                <input 
                  autoFocus
                  type="text"
                  placeholder="Chapter title..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowAddChapter(false)} className="text-xs font-bold text-slate-500 px-2 py-1 hover:bg-slate-100 rounded">Cancel</button>
                  <button onClick={handleAddChapter} className="text-xs font-bold text-primary-600 px-2 py-1 hover:bg-primary-50 rounded">Save</button>
                </div>
              </div>
            )}

            {courseData?.chapters?.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                  activeChapterId === chapter.id 
                    ? 'bg-primary-50 text-primary-700 font-bold' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-xs opacity-50">#0{chapter.order}</span>
                  <span className="truncate text-sm">{chapter.title}</span>
                </div>
                <ChevronRight size={14} className={activeChapterId === chapter.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {activeChapter ? (
            <div className="max-w-4xl mx-auto space-y-10">
              {/* Chapter Header */}
              <div className="flex items-end justify-between border-b border-slate-200 pb-6">
                <div>
                   <span className="text-xs font-extrabold text-primary-600 uppercase tracking-widest">Selected Chapter</span>
                   <h1 className="text-4xl font-black text-slate-900 mt-1">{activeChapter.title}</h1>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <MoreVertical size={24} />
                </button>
              </div>

              {/* Notes Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <FileText size={20} className="text-amber-500" />
                     Instructional Notes
                   </h3>
                   {!showAddNote && (
                     <button 
                       onClick={() => setShowAddNote(true)}
                       className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-1"
                     >
                       <Plus size={16} /> Add Note
                     </button>
                   )}
                </div>

                {showAddNote ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ring-4 ring-primary-500/5">
                    <textarea 
                      rows="8"
                      autoFocus
                      className="w-full focus:outline-none text-slate-700 leading-relaxed placeholder:text-slate-300"
                      placeholder="Share your expert knowledge here..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                       <button onClick={() => setShowAddNote(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Discard</button>
                       <button onClick={handleAddNote} className="px-6 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2">
                         <Save size={16} />
                         Save Note
                       </button>
                    </div>
                  </div>
                ) : activeChapter.notes?.length > 0 ? (
                  <div className="space-y-3">
                    {activeChapter.notes.map((note) => (
                      <div key={note.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm group relative">
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-600 whitespace-pre-wrap">{note.content}</p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50/50">
                    <p className="text-slate-400 text-sm italic font-medium">No instructional notes added to this chapter yet.</p>
                  </div>
                )}
              </section>

              {/* Materials Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <FileUp size={20} className="text-blue-500" />
                     Learning Materials
                   </h3>
                   <button 
                     onClick={() => {
                       setMaterialError('');
                       setShowAddMaterial(true);
                     }}
                     className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm"
                   >
                     Add Material
                   </button>
                </div>

                {showAddMaterial && (
                  <div className="bg-white border border-primary-100 rounded-2xl p-6 shadow-xl ring-8 ring-primary-500/5 animate-in zoom-in-95">
                    <h4 className="font-bold text-slate-800 mb-4">Add New Resource</h4>
                    <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                           placeholder="e.g. Introduction to React Hooks PDF"
                           value={materialTitle}
                           onChange={(e) => setMaterialTitle(e.target.value)}
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setMaterialType('learning')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              materialType === 'learning' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                             <FileUp size={24} />
                             <span className="text-xs font-bold">Upload File (PDF)</span>
                          </button>
                          <button 
                            onClick={() => setMaterialType('reference')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              materialType === 'reference' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                             <LinkIcon size={24} />
                             <span className="text-xs font-bold">External Link</span>
                          </button>
                       </div>
                       
                       {materialType === 'learning' ? (
                         <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                            <input 
                              type="file" 
                              id="file-upload" 
                              className="hidden" 
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setMaterialFile(e.target.files[0])}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                               <FileUp className="text-slate-300" size={32} />
                               <span className="text-sm text-slate-500 font-medium">
                                 {materialFile ? materialFile.name : 'Drop your file here or click to browse'}
                               </span>
                            </label>
                         </div>
                       ) : (
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Resource URL</label>
                            <input 
                              type="url" 
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                              placeholder="https://example.com/resource"
                              value={materialUrl}
                              onChange={(e) => setMaterialUrl(e.target.value)}
                            />
                         </div>
                       )}

                       {materialError && (
                         <p className="text-sm font-medium text-red-600">{materialError}</p>
                       )}

                       <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={() => {
                              setShowAddMaterial(false);
                              setMaterialError('');
                            }}
                            disabled={isUploading}
                            className="px-4 py-2 text-sm font-bold text-slate-500 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleAddMaterial}
                            disabled={isUploading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isUploading ? (
                              <><Loader2 size={16} className="animate-spin" /> Uploading to Cloud...</>
                            ) : (
                              <><Cloud size={16} /> Add Resource</>
                            )}
                          </button>
                       </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeChapter.learning_materials?.map((m) => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-primary-200 transition-colors">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-3 bg-red-50 text-red-500 rounded-xl"><FileText size={20} /></div>
                        <div className="overflow-hidden">
                           <p className="text-sm font-bold text-slate-800 truncate">{m.title}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.file_type} DOCUMENT</p>
                        </div>
                      </div>
                      <a href={m.file_url} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  ))}
                  {activeChapter.reference_materials?.map((m) => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-primary-200 transition-colors">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><LinkIcon size={20} /></div>
                        <div className="overflow-hidden">
                           <p className="text-sm font-bold text-slate-800 truncate">{m.title}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">EXTERNAL {m.source_type}</p>
                        </div>
                      </div>
                      <a href={m.url_or_link} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200/50">
                  <BookOpen size={40} className="text-slate-200" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-800">Ready to build?</h2>
                 <p className="text-slate-400 max-w-sm mt-2">Select a chapter from the sidebar or create a new one to start adding instructional content.</p>
               </div>
               <button 
                 onClick={() => setShowAddChapter(true)}
                 className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
               >
                 Create First Chapter
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContentEditor;
