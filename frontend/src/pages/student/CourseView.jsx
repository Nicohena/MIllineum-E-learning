// pages/student/CourseView.jsx (with custom content)
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';
import { Video, FileText } from 'lucide-react';

const CourseView = () => {
  return (
    <MockModulePage {...modulePageMockData.courseView}>
      {/* Custom content specific to course view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <Video size={20} className="text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Recent Lectures</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">• Introduction to Web Development</p>
            <p className="text-sm text-slate-600">• HTML5 Semantic Elements</p>
            <p className="text-sm text-slate-600">• CSS Flexbox & Grid</p>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <FileText size={20} className="text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Recent Materials</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">• Course Syllabus 2024.pdf</p>
            <p className="text-sm text-slate-600">• Week 1 Slides.pptx</p>
            <p className="text-sm text-slate-600">• Practice Exercises.zip</p>
          </div>
        </div>
      </div>
    </MockModulePage>
  );
};

export default CourseView;