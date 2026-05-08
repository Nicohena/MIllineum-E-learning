// pages/student/AttendanceViewEnhanced.jsx (future implementation)
import { Calendar, AlertCircle, Download } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';

const AttendanceView = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAttendance(selectedMonth, selectedYear);
      setAttendanceData(response);
      setError(null);
    } catch (err) {
      setError('Failed to load attendance data');
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card variant="white" padding="lg" className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Attendance</h2>
          <p className="text-slate-600">{error}</p>
          <Button onClick={fetchAttendance} className="mt-4">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const stats = attendanceData?.statistics || {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  };

  const attendance = attendanceData?.attendance || [];

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
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            Download Report
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Overall Attendance</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.percentage}%</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
            </div>
          </div>
        </Card>
        
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Present Days</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.present}</p>
            <p className="text-xs text-slate-400">This month</p>
          </div>
        </Card>
        
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Absent Days</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.absent}</p>
            <p className="text-xs text-slate-400">This month</p>
          </div>
        </Card>
        
        <Card variant="white" padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-500">Late Arrivals</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.late}</p>
            <p className="text-xs text-slate-400">This month</p>
          </div>
        </Card>
      </div>

      {/* Course-wise Attendance */}
      <Card variant="glass" padding="lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Attendance Records</h2>
        {attendance.length > 0 ? (
          <div className="space-y-3">
            {attendance.slice(0, 10).map((record, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'present' ? 'bg-emerald-500' :
                    record.status === 'late' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-semibold text-slate-800">{record.subject_title}</p>
                    <p className="text-sm text-slate-500">{record.date}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  record.status === 'present' ? 'text-emerald-700 bg-emerald-100' :
                  record.status === 'late' ? 'text-amber-700 bg-amber-100' :
                  'text-red-700 bg-red-100'
                }`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No attendance records found for this period</p>
          </div>
        )}
      </Card>
    </div>
  );
};
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