// pages/student/AttendanceViewEnhanced.jsx (future implementation)
import { Calendar, AlertCircle, Download } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const AttendanceView = () => {
  const selectedMonth = 'December 2024';
  
  // Mock attendance data
  const attendanceData = {
    overall: 87,
    courses: [
      { name: 'Web Development', percentage: 92, present: 23, total: 25, status: 'good' },
      { name: 'Data Science', percentage: 78, present: 39, total: 50, status: 'warning' },
      { name: 'UI/UX Design', percentage: 95, present: 19, total: 20, status: 'excellent' },
      { name: 'Database Systems', percentage: 82, present: 41, total: 50, status: 'good' }
    ],
    monthly: {
      present: 18,
      absent: 3,
      late: 2,
      total: 23
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'danger': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Attendance</h1>
          <p className="text-slate-500 mt-1">Track your class attendance across all courses</p>
        </div>
        <Button variant="secondary" leftIcon={<Download size={16} />}>
          Download Report
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Overall Attendance</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{attendanceData.overall}%</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${attendanceData.overall}%` }}></div>
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Present Days</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{attendanceData.monthly.present}</p>
            <p className="text-xs text-slate-400">This month</p>
          </div>
        </Card>
        
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Absent Days</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{attendanceData.monthly.absent}</p>
            <p className="text-xs text-slate-400">This month</p>
          </div>
        </Card>
        
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Late Arrivals</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{attendanceData.monthly.late}</p>
            <p className="text-xs text-slate-400">This month</p>
          </div>
        </Card>
      </div>

      {/* Course-wise Attendance */}
      <Card variant="glass" padding="lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Course-wise Attendance</h2>
        <div className="space-y-4">
          {attendanceData.courses.map((course, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <div>
                  <p className="font-semibold text-slate-800">{course.name}</p>
                  <p className="text-sm text-slate-500">{course.present}/{course.total} days present</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(course.status)}`}>
                  {course.percentage}% Attendance
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    course.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${course.percentage}%` }}
                />
              </div>
              {course.percentage < 75 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Below minimum requirement (75%)
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar View Placeholder */}
      <Card variant="glass" padding="lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Monthly Calendar</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Previous</Button>
            <Button size="sm" variant="primary">{selectedMonth}</Button>
            <Button size="sm" variant="secondary">Next</Button>
          </div>
        </div>
        <div className="text-center py-8 text-slate-500">
          <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
          <p>Interactive calendar view coming soon!</p>
          <p className="text-sm mt-1">Track your daily attendance with color-coded indicators</p>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceView;