// pages/student/GradesViewEnhanced.jsx (future implementation)
import { useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const GradesView = () => {
  const [selectedSemester, setSelectedSemester] = useState('Fall 2024');
  const [expandedCourse, setExpandedCourse] = useState(null);
  
  // Mock grade data
  const overallGPA = 3.75;
  const totalCredits = 48;
  const completedCredits = 32;
  
  const courses = [
    {
      id: 1,
      name: 'Web Development Fundamentals',
      code: 'CS301',
      credits: 3,
      grade: 'A',
      percentage: 92,
      status: 'completed',
      instructor: 'Prof. Sarah Johnson',
      assignments: [
        { name: 'HTML/CSS Project', score: 95, total: 100, weight: 25 },
        { name: 'JavaScript Quiz', score: 88, total: 100, weight: 15 },
        { name: 'React Assignment', score: 92, total: 100, weight: 30 },
        { name: 'Final Project', score: 94, total: 100, weight: 30 }
      ]
    },
    {
      id: 2,
      name: 'Data Science with Python',
      code: 'DS401',
      credits: 4,
      grade: 'B+',
      percentage: 85,
      status: 'in-progress',
      instructor: 'Dr. Michael Chen',
      assignments: [
        { name: 'Data Analysis Project', score: 82, total: 100, weight: 20 },
        { name: 'Machine Learning Quiz', score: 88, total: 100, weight: 20 },
        { name: 'Final Exam', score: null, total: 100, weight: 40 }
      ]
    },
    {
      id: 3,
      name: 'UI/UX Design Principles',
      code: 'DES202',
      credits: 3,
      grade: 'A-',
      percentage: 88,
      status: 'completed',
      instructor: 'Emily Watson',
      assignments: [
        { name: 'User Research', score: 90, total: 100, weight: 20 },
        { name: 'Wireframing Project', score: 85, total: 100, weight: 30 },
        { name: 'Prototype Submission', score: 89, total: 100, weight: 50 }
      ]
    }
  ];
  
  const getGradeColor = (grade) => {
    const colors = {
      'A': 'text-emerald-600',
      'A-': 'text-emerald-600',
      'B+': 'text-blue-600',
      'B': 'text-blue-600',
      'B-': 'text-blue-600',
      'C+': 'text-amber-600',
      'C': 'text-amber-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
    };
    return colors[grade] || 'text-slate-600';
  };
  
  const getGradeBgColor = (grade) => {
    const colors = {
      'A': 'bg-emerald-50',
      'A-': 'bg-emerald-50',
      'B+': 'bg-blue-50',
      'B': 'bg-blue-50',
      'B-': 'bg-blue-50',
      'C+': 'bg-amber-50',
      'C': 'bg-amber-50',
      'D': 'bg-orange-50',
      'F': 'bg-red-50'
    };
    return colors[grade] || 'bg-slate-50';
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Grades</h1>
          <p className="text-slate-500 mt-1">Track your academic performance and progress</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option>Fall 2024</option>
            <option>Spring 2024</option>
            <option>Fall 2023</option>
          </select>
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            Export
          </Button>
        </div>
      </div>
      
      {/* GPA Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="gradient" padding="lg" className="text-white">
          <div className="text-center">
            <p className="text-white/80 text-sm">Current GPA</p>
            <p className="text-4xl font-bold mt-1">{overallGPA}</p>
            <p className="text-white/70 text-sm mt-1">/ 4.00 Scale</p>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="text-center">
            <p className="text-slate-500 text-sm">Credits Completed</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{completedCredits}</p>
            <p className="text-slate-400 text-sm mt-1">/ {totalCredits} Total</p>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="text-center">
            <p className="text-slate-500 text-sm">Courses Taken</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{courses.length}</p>
            <p className="text-slate-400 text-sm mt-1">This Semester</p>
          </div>
        </Card>
        
        <Card variant="white" padding="lg">
          <div className="text-center">
            <p className="text-slate-500 text-sm">Class Rank</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">Top 15%</p>
            <p className="text-slate-400 text-sm mt-1">of 234 students</p>
          </div>
        </Card>
      </div>
      
      {/* Performance Chart Placeholder */}
      <Card variant="glass" padding="lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Performance Trend</h3>
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <TrendingUp size={16} />
            <span>+8% from last semester</span>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm">Interactive chart will appear here</p>
            <p className="text-xs text-slate-300">Showing grade progression over time</p>
          </div>
        </div>
      </Card>
      
      {/* Course Grades List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Course Breakdown</h3>
        
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div 
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={16} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-600">{course.code}</span>
                    <span className="text-xs text-slate-400">• {course.credits} credits</span>
                  </div>
                  <h4 className="font-bold text-slate-800">{course.name}</h4>
                  <p className="text-sm text-slate-500">{course.instructor}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Final Grade</p>
                    <p className={`text-2xl font-bold ${getGradeColor(course.grade)}`}>{course.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Percentage</p>
                    <p className="text-xl font-semibold text-slate-800">{course.percentage}%</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getGradeBgColor(course.grade)}`}>
                    {expandedCourse === course.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expanded Assignment Details */}
            {expandedCourse === course.id && (
              <div className="border-t border-slate-100 p-5 bg-slate-50">
                <h5 className="font-semibold text-slate-800 mb-3">Assignment Breakdown</h5>
                <div className="space-y-3">
                  {course.assignments.map((assignment, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-slate-700 text-sm">{assignment.name}</p>
                        <p className="text-xs text-slate-400">Weight: {assignment.weight}%</p>
                      </div>
                      <div className="text-right">
                        {assignment.score ? (
                          <>
                            <p className="text-lg font-semibold text-slate-800">
                              {assignment.score}/{assignment.total}
                            </p>
                            <p className="text-xs text-emerald-600">
                              {Math.round((assignment.score / assignment.total) * 100)}%
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-amber-600 flex items-center gap-1">
                            <Clock size={14} />
                            Pending
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <p className="text-sm text-slate-500">Overall Performance</p>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">{course.percentage}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Grade Scale Reference */}
      <Card variant="glass" padding="lg">
        <h3 className="font-bold text-slate-800 mb-3">Grade Scale Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-sm">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <p className="font-bold text-emerald-700">A</p>
            <p className="text-xs text-slate-500">90-100%</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="font-bold text-blue-700">B</p>
            <p className="text-xs text-slate-500">80-89%</p>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg">
            <p className="font-bold text-amber-700">C</p>
            <p className="text-xs text-slate-500">70-79%</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <p className="font-bold text-orange-700">D</p>
            <p className="text-xs text-slate-500">60-69%</p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <p className="font-bold text-red-700">F</p>
            <p className="text-xs text-slate-500">&lt;60%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GradesView;