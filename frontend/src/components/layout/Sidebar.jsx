/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  User,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
  GraduationCap,
  Video,
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, isOpen, badge }) => (
  <Link
    to={to}
    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
      active
        ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    } ${!isOpen ? 'justify-center px-2' : ''}`}
  >
    <Icon size={18} className="shrink-0" />
    {isOpen && <span className="text-sm font-medium truncate flex-1">{label}</span>}
    {isOpen && badge && (
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
        {badge}
      </span>
    )}
    {!isOpen && (
      <span className="pointer-events-none absolute left-full ml-2 rounded-lg bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow group-hover:opacity-100">
        {label}
      </span>
    )}
  </Link>
);

const SidebarSection = ({ title, items, isOpen, pathname }) => (
  <section className="space-y-1.5">
    {isOpen && <p className="px-2 text-[11px] uppercase tracking-wider text-slate-400">{title}</p>}
    {items.map((item) => (
      <SidebarLink
        key={item.to}
        to={item.to}
        icon={item.icon}
        label={item.label}
        badge={item.badge}
        isOpen={isOpen}
        active={pathname === item.to}
      />
    ))}
  </section>
);

export const Sidebar = ({ isOpen, setOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !isOpen) {
        setOpen(true);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (isMobile && isOpen) {
      setOpen(false);
    }
  }, [location.pathname, isMobile, isOpen, setOpen]);

  const sections = useMemo(() => {
    const dashboard = [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }];

    if (user?.role === 'admin') {
      return [
        {
          title: 'Management',
          items: [
            ...dashboard,
            { to: '/admin/users', icon: Users, label: 'Users' },
            { to: '/admin/courses', icon: GraduationCap, label: 'Classes & Subjects' },
            { to: '/admin/settings', icon: Settings, label: 'Academic Years' },
          ],
        },
      ];
    }

    if (user?.role === 'teacher') {
      return [
        {
          title: 'Teaching',
          items: [
            ...dashboard,
            { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
            { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
            { to: '/teacher/live-classes', icon: Video, label: 'Live Classes' },
            { to: '/teacher/grading', icon: BarChart3, label: 'Grading' },
            { to: '/teacher/forum', icon: MessageSquare, label: 'Messages', badge: '3' },
          ],
        },
      ];
    }

    return [
      {
        title: 'Learning',
        items: [
          ...dashboard,
          { to: '/student/courses', icon: BookOpen, label: 'My Learning' },
          { to: '/student/assignments', icon: FileText, label: 'Assignments', badge: '2' },
          { to: '/student/live-classes', icon: Video, label: 'Live Classes' },
          { to: '/student/grades', icon: BarChart3, label: 'My Grades' },
          { to: '/student/messages', icon: MessageSquare, label: 'Messaging', badge: '5' },
        ],
      },
    ];
  }, [user?.role]);

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-slate-900/35 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed z-50 h-screen border-r border-slate-200 bg-white transition-all duration-300 lg:relative lg:z-0 ${
          isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
        } overflow-hidden`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-sm font-bold text-white shadow">M</div>
              {isOpen && (
                <div>
                  <p className="text-base font-bold text-slate-800">Millennium</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">E-learning</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:block"
                aria-label="Toggle sidebar"
              >
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
            {sections.map((section) => (
              <SidebarSection
                key={section.title}
                title={section.title}
                items={section.items}
                isOpen={isOpen}
                pathname={location.pathname}
              />
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-100 p-3">
           

            <div className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 ${!isOpen ? 'justify-center' : ''}`}>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 shadow-sm">
                <User size={16} />
              </div>
              {isOpen && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="truncate text-[11px] uppercase tracking-wide text-slate-400">{user?.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
