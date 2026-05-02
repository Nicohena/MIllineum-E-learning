import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import {
  Plus, Trash2, BookOpen, Layers, UserCheck,
  CheckCircle2, Loader2, X, School, BookMarked, ArrowRight
} from 'lucide-react';

const ClassSubjectManager = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { msg, type }

  // Form states
  const [className, setClassName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [selectedSubjectTeacherIds, setSelectedSubjectTeacherIds] = useState([]);
  const [assignForm, setAssignForm] = useState({ class_id: '', subject_id: '', teacher_id: '' });
  const [submitting, setSubmitting] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [studentToAddId, setStudentToAddId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [teacherToAddId, setTeacherToAddId] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [classPage, setClassPage] = useState(1);
  const [subjectPage, setSubjectPage] = useState(1);
  const availableStudents = students.filter((student) => !student.class_id);
  const unassignedTeachers = teachers.filter((teacher) => !(teacher.teaching_subject || '').trim());
  const selectedAssignmentSubject = subjects.find((subject) => Number(subject.id) === Number(assignForm.subject_id));
  const assignableTeachers = selectedAssignmentSubject
    ? teachers.filter((teacher) =>
        (teacher.teaching_subject || '').trim().toLowerCase() === (selectedAssignmentSubject.name || '').trim().toLowerCase()
      )
    : [];
  const selectedClass = classes.find((classItem) => Number(classItem.id) === Number(selectedClassId)) || null;
  const studentsInSelectedClass = selectedClass
    ? students.filter((student) => Number(student.class_id) === Number(selectedClass.id))
    : [];
  const studentsAvailableToAdd = selectedClass
    ? students.filter((student) => Number(student.class_id) !== Number(selectedClass.id))
    : [];
  const selectedSubject = subjects.find((subject) => Number(subject.id) === Number(selectedSubjectId)) || null;
  const teachersInSelectedSubject = selectedSubject
    ? teachers.filter((teacher) =>
        (teacher.teaching_subject || '').trim().toLowerCase() === (selectedSubject.name || '').trim().toLowerCase()
      )
    : [];
  const teachersAvailableToAddToSubject = selectedSubject
    ? teachers.filter((teacher) =>
        (teacher.teaching_subject || '').trim().toLowerCase() !== (selectedSubject.name || '').trim().toLowerCase()
      )
    : [];
  const listPageSize = 8;
  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(classSearch.trim().toLowerCase())
  );
  const filteredSubjects = subjects.filter((subjectItem) =>
    subjectItem.name.toLowerCase().includes(subjectSearch.trim().toLowerCase())
  );
  const classTotalPages = Math.max(1, Math.ceil(filteredClasses.length / listPageSize));
  const subjectTotalPages = Math.max(1, Math.ceil(filteredSubjects.length / listPageSize));
  const paginatedClasses = filteredClasses.slice((classPage - 1) * listPageSize, classPage * listPageSize);
  const paginatedSubjects = filteredSubjects.slice((subjectPage - 1) * listPageSize, subjectPage * listPageSize);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cls, subs, tchs, stds, asgns] = await Promise.all([
        adminService.getClasses(),
        adminService.getSubjects(),
        adminService.getUsers('teacher'),
        adminService.getUsers('student'),
        adminService.getAssignments(),
      ]);
      setClasses(cls);
      setSubjects(subs);
      setTeachers(tchs);
      setStudents(stds);
      setAssignments(asgns);
      setSelectedSubjectTeacherIds((currentIds) => {
        const availableIds = new Set(tchs
          .filter((teacher) => !(teacher.teaching_subject || '').trim())
          .map((teacher) => Number(teacher.id))
        );
        return currentIds.filter((id) => availableIds.has(Number(id)));
      });
      setSelectedClassId((currentClassId) => (
        cls.some((classItem) => Number(classItem.id) === Number(currentClassId)) ? currentClassId : null
      ));
      setSelectedSubjectId((currentSubjectId) => (
        subs.some((subjectItem) => Number(subjectItem.id) === Number(currentSubjectId)) ? currentSubjectId : null
      ));
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    setClassPage(1);
  }, [classSearch]);

  useEffect(() => {
    setSubjectPage(1);
  }, [subjectSearch]);

  useEffect(() => {
    setClassPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(filteredClasses.length / listPageSize))));
  }, [filteredClasses.length]);

  useEffect(() => {
    setSubjectPage((currentPage) => Math.min(currentPage, Math.max(1, Math.ceil(filteredSubjects.length / listPageSize))));
  }, [filteredSubjects.length]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    if (selectedStudentIds.length === 0) {
      showToast('Select at least one student for the new class', 'error');
      return;
    }
    setSubmitting('class');
    try {
      const response = await adminService.createClass({
        name: className.trim(),
        student_ids: selectedStudentIds,
      });
      setClassName('');
      setSelectedStudentIds([]);
      if (response?.class_id) {
        setSelectedClassId(response.class_id);
      }
      showToast('Class created and students assigned successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to create class', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setSubmitting('subject');
    try {
      const response = await adminService.createSubject({
        name: subjectName.trim(),
        teacher_ids: selectedSubjectTeacherIds,
      });
      setSubjectName('');
      setSelectedSubjectTeacherIds([]);
      if (response?.subject_id) {
        setSelectedSubjectId(response.subject_id);
      }
      if ((response?.assigned_teachers || 0) > 0) {
        showToast(`Subject created and ${response.assigned_teachers} teacher(s) assigned`);
      } else {
        showToast('Subject created successfully');
      }
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to create subject', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const toggleSubjectTeacherSelection = (teacherId) => {
    setSelectedSubjectTeacherIds((current) => (
      current.includes(teacherId)
        ? current.filter((id) => id !== teacherId)
        : [...current, teacherId]
    ));
  };

  const handleDeleteClass = async (classItem) => {
    const confirmDelete = window.confirm(
      `Delete class "${classItem.name}"? This will remove related class assignments and student enrollments for this class.`
    );
    if (!confirmDelete) {
      return;
    }

    setSubmitting(`delete-class-${classItem.id}`);
    try {
      await adminService.deleteClass(classItem.id);
      if (Number(selectedClassId) === Number(classItem.id)) {
        setSelectedClassId(null);
      }
      showToast('Class deleted successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete class', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleAddStudentToClass = async (e) => {
    e.preventDefault();

    if (!selectedClass || !studentToAddId) {
      return;
    }

    const student = students.find((item) => Number(item.id) === Number(studentToAddId));
    if (!student) {
      showToast('Selected student was not found', 'error');
      return;
    }

    if (student.class_id && Number(student.class_id) !== Number(selectedClass.id)) {
      const shouldMove = window.confirm(
        `${student.name} is currently in ${student.class_name || 'another class'}. Move this student to ${selectedClass.name}?`
      );
      if (!shouldMove) {
        return;
      }
    }

    setSubmitting('add-student');
    try {
      await adminService.assignStudent({
        student_id: Number(studentToAddId),
        class_id: Number(selectedClass.id),
      });
      setStudentToAddId('');
      showToast('Student added to class successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to add student to class', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleDeleteSubject = async (subjectItem) => {
    const confirmDelete = window.confirm(
      `Delete subject "${subjectItem.name}"? This will remove related teacher assignments for this subject.`
    );
    if (!confirmDelete) {
      return;
    }

    setSubmitting(`delete-subject-${subjectItem.id}`);
    try {
      await adminService.deleteSubject(subjectItem.id);
      if (Number(selectedSubjectId) === Number(subjectItem.id)) {
        setSelectedSubjectId(null);
      }
      showToast('Subject deleted successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete subject', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleAddTeacherToSubject = async (e) => {
    e.preventDefault();

    if (!selectedSubject || !teacherToAddId) {
      return;
    }

    setSubmitting('add-subject-teacher');
    try {
      await adminService.addTeachersToSubject({
        subject_id: Number(selectedSubject.id),
        teacher_ids: [Number(teacherToAddId)],
      });
      setTeacherToAddId('');
      showToast('Teacher added to subject successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to add teacher to subject', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleRemoveTeacherFromSubject = async (teacherItem) => {
    if (!selectedSubject) {
      return;
    }

    const confirmRemove = window.confirm(
      `Remove ${teacherItem.name} from ${selectedSubject.name}?`
    );
    if (!confirmRemove) {
      return;
    }

    setSubmitting(`remove-subject-teacher-${teacherItem.id}`);
    try {
      await adminService.removeTeacherFromSubject({
        subject_id: Number(selectedSubject.id),
        teacher_id: Number(teacherItem.id),
      });
      showToast('Teacher removed from subject successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to remove teacher from subject', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    setSubmitting('assign');
    try {
      await adminService.assignTeacher({
        class_id: Number(assignForm.class_id),
        subject_id: Number(assignForm.subject_id),
        teacher_id: Number(assignForm.teacher_id),
      });
      setAssignForm({ class_id: '', subject_id: '', teacher_id: '' });
      showToast('Teacher assigned successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.details || err?.response?.data?.error || 'Assignment failed', 'error');
    } finally {
      setSubmitting('');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Setup</h1>
        <p className="text-slate-500 mt-2 font-medium">Create classes with students already assigned, define subjects, and connect teachers to their designated sections.</p>
      </div>

      {/* 3 Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Create Class */}
        <form onSubmit={handleCreateClass} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-5 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <School size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">New Class</h2>
              <p className="text-xs text-slate-400 font-medium">e.g. "Grade 10A"</p>
            </div>
          </div>
          <input
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Class name..."
            className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-normal placeholder:text-slate-300"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Students</p>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                {selectedStudentIds.length} selected
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-2xl bg-slate-50 p-3 space-y-2">
              {availableStudents.length > 0 ? (
                availableStudents.map((student) => {
                  const checked = selectedStudentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                        checked ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {student.student_identifier || 'Student ID pending'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  );
                })
              ) : (
                <p className="px-3 py-6 text-sm text-slate-400 text-center font-medium">
                  No unassigned students available. Create a student account or remove a student from another class first.
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting === 'class' || availableStudents.length === 0}
            className="mt-auto w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting === 'class' ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Create Class
          </button>
        </form>

        {/* Create Subject */}
        <form onSubmit={handleCreateSubject} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-5 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <BookMarked size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">New Subject</h2>
              <p className="text-xs text-slate-400 font-medium">e.g. "Mathematics"</p>
            </div>
          </div>
          <input
            required
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Subject name..."
            className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:font-normal placeholder:text-slate-300"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Teachers to Subject</p>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                {selectedSubjectTeacherIds.length} selected
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-2xl bg-slate-50 p-3 space-y-2">
              {unassignedTeachers.length > 0 ? (
                unassignedTeachers.map((teacher) => {
                  const checked = selectedSubjectTeacherIds.includes(teacher.id);
                  return (
                    <label
                      key={teacher.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                        checked ? 'bg-amber-50 border border-amber-100' : 'bg-white border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{teacher.name}</p>
                        <p className="text-xs text-slate-400 truncate">{teacher.teaching_subject || 'No subject specialization set'}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSubjectTeacherSelection(teacher.id)}
                        className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                    </label>
                  );
                })
              ) : (
                <p className="px-3 py-6 text-sm text-slate-400 text-center font-medium">
                  No unassigned teachers available. Remove a teacher from another subject or create a new teacher account.
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting === 'subject'}
            className="mt-auto w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting === 'subject' ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Create Subject
          </button>
        </form>

        {/* Assign Teacher */}
        <form onSubmit={handleAssignTeacher} className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl p-7 space-y-4 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <UserCheck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Assign Teacher</h2>
              <p className="text-xs text-slate-400 font-medium">Link to class & subject</p>
            </div>
          </div>
          <select
            required
            value={assignForm.class_id}
            onChange={(e) => setAssignForm(p => ({ ...p, class_id: e.target.value }))}
            className="w-full px-5 py-3 bg-white/10 text-white rounded-2xl outline-none font-bold focus:bg-white/20 transition-all appearance-none"
          >
            <option value="" className="text-slate-900">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
          </select>
          <select
            required
            value={assignForm.subject_id}
            onChange={(e) => setAssignForm(p => ({ ...p, subject_id: e.target.value, teacher_id: '' }))}
            className="w-full px-5 py-3 bg-white/10 text-white rounded-2xl outline-none font-bold focus:bg-white/20 transition-all appearance-none"
          >
            <option value="" className="text-slate-900">Select subject…</option>
            {subjects.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
          </select>
          <select
            required
            value={assignForm.teacher_id}
            onChange={(e) => setAssignForm(p => ({ ...p, teacher_id: e.target.value }))}
            disabled={!assignForm.subject_id}
            className="w-full px-5 py-3 bg-white/10 text-white rounded-2xl outline-none font-bold focus:bg-white/20 transition-all appearance-none"
          >
            <option value="" className="text-slate-900">
              {assignForm.subject_id ? 'Select teacher…' : 'Select subject first…'}
            </option>
            {assignableTeachers.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.name} ({t.teaching_subject || 'General'})</option>)}
          </select>
          <button
            type="submit"
            disabled={submitting === 'assign'}
            className="mt-auto w-full py-3.5 bg-white text-slate-900 font-black rounded-2xl transition-all hover:bg-slate-100 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting === 'assign' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            Confirm Assignment
          </button>
        </form>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Classes List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={20} className="text-indigo-600" />
            <h3 className="text-xl font-black text-slate-900">Classes <span className="text-slate-300 font-normal">({classes.length})</span></h3>
          </div>
          <input
            type="text"
            value={classSearch}
            onChange={(event) => setClassSearch(event.target.value)}
            placeholder="Search classes..."
            className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-300"
          />
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : paginatedClasses.length > 0 ? (
              paginatedClasses.map(c => (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedClassId(c.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedClassId(c.id);
                    }
                  }}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-2xl group transition-colors cursor-pointer ${
                    Number(selectedClassId) === Number(c.id)
                      ? 'bg-indigo-100 ring-2 ring-indigo-200'
                      : 'bg-indigo-50/50 hover:bg-indigo-50'
                  }`}
                >
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ID #{c.id}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteClass(c);
                      }}
                      disabled={submitting === `delete-class-${c.id}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white transition-colors disabled:opacity-50"
                      title="Delete class"
                    >
                      {submitting === `delete-class-${c.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 text-sm font-medium">No classes found.</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {paginatedClasses.length} of {filteredClasses.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setClassPage((page) => Math.max(1, page - 1))}
                disabled={classPage <= 1}
                className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-semibold">{classPage}/{classTotalPages}</span>
              <button
                type="button"
                onClick={() => setClassPage((page) => Math.min(classTotalPages, page + 1))}
                disabled={classPage >= classTotalPages}
                className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {selectedClass && (
            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800">Students in {selectedClass.name}</h4>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  {studentsInSelectedClass.length} students
                </span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {studentsInSelectedClass.length > 0 ? (
                  studentsInSelectedClass.map((student) => (
                    <div key={student.id} className="rounded-xl bg-white px-3 py-2 border border-indigo-100">
                      <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                      <p className="text-xs text-slate-400 truncate">{student.student_identifier || 'Student ID pending'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No students are currently assigned to this class.</p>
                )}
              </div>

              <form onSubmit={handleAddStudentToClass} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Student</label>
                <div className="flex gap-2">
                  <select
                    value={studentToAddId}
                    onChange={(event) => setStudentToAddId(event.target.value)}
                    className="flex-1 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select student...</option>
                    {studentsAvailableToAdd.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.student_identifier || `Student #${student.id}`} - {student.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={submitting === 'add-student' || !studentToAddId}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {submitting === 'add-student' ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Subjects List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7">
          <div className="flex items-center gap-3 mb-6">
            <Layers size={20} className="text-amber-500" />
            <h3 className="text-xl font-black text-slate-900">Subjects <span className="text-slate-300 font-normal">({subjects.length})</span></h3>
          </div>
          <input
            type="text"
            value={subjectSearch}
            onChange={(event) => setSubjectSearch(event.target.value)}
            placeholder="Search subjects..."
            className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-amber-300"
          />
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : paginatedSubjects.length > 0 ? (
              paginatedSubjects.map(s => (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSubjectId(s.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedSubjectId(s.id);
                    }
                  }}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-2xl group transition-colors cursor-pointer ${
                    Number(selectedSubjectId) === Number(s.id)
                      ? 'bg-amber-100 ring-2 ring-amber-200'
                      : 'bg-amber-50/50 hover:bg-amber-50'
                  }`}
                >
                  <span className="font-bold text-slate-800">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">ID #{s.id}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteSubject(s);
                      }}
                      disabled={submitting === `delete-subject-${s.id}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white transition-colors disabled:opacity-50"
                      title="Delete subject"
                    >
                      {submitting === `delete-subject-${s.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 text-sm font-medium">No subjects found.</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {paginatedSubjects.length} of {filteredSubjects.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubjectPage((page) => Math.max(1, page - 1))}
                disabled={subjectPage <= 1}
                className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-semibold">{subjectPage}/{subjectTotalPages}</span>
              <button
                type="button"
                onClick={() => setSubjectPage((page) => Math.min(subjectTotalPages, page + 1))}
                disabled={subjectPage >= subjectTotalPages}
                className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {selectedSubject && (
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800">Teachers for {selectedSubject.name}</h4>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  {teachersInSelectedSubject.length} teachers
                </span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {teachersInSelectedSubject.length > 0 ? (
                  teachersInSelectedSubject.map((teacher) => (
                    <div key={teacher.id} className="rounded-xl bg-white px-3 py-2 border border-amber-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{teacher.name}</p>
                        <p className="text-xs text-slate-400 truncate">{teacher.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeacherFromSubject(teacher)}
                        disabled={submitting === `remove-subject-teacher-${teacher.id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                        title="Remove teacher"
                      >
                        {submitting === `remove-subject-teacher-${teacher.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No teachers assigned to this subject yet.</p>
                )}
              </div>

              <form onSubmit={handleAddTeacherToSubject} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Teacher</label>
                <div className="flex gap-2">
                  <select
                    value={teacherToAddId}
                    onChange={(event) => setTeacherToAddId(event.target.value)}
                    className="flex-1 rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="">Select teacher...</option>
                    {teachersAvailableToAddToSubject.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.teaching_subject || 'No subject'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={submitting === 'add-subject-teacher' || !teacherToAddId}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    {submitting === 'add-subject-teacher' ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
        <div className="p-7 border-b border-slate-50 flex items-center gap-3">
          <UserCheck size={20} className="text-emerald-600" />
          <h3 className="text-xl font-black text-slate-900">Current Teacher Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class</th>
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject</th>
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Teacher</th>
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-7 py-12 text-center"><Loader2 className="animate-spin text-slate-200 mx-auto" size={32} /></td></tr>
              ) : assignments.length > 0 ? (
                assignments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-7 py-4 font-bold text-slate-800">{a.class_name}</td>
                    <td className="px-7 py-4 text-slate-600 font-medium">{a.subject_name}</td>
                    <td className="px-7 py-4 text-slate-600 font-medium">{a.teacher_name}</td>
                    <td className="px-7 py-4 text-slate-400 text-sm">{a.academic_year_name}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-7 py-12 text-center text-slate-400 font-medium text-sm">No teacher assignments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassSubjectManager;
