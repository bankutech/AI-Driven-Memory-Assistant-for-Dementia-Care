import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Brain, Users, CalendarDays, Bell, Phone, Settings, Search,
  Menu, X, LogOut, UserCircle, Activity, MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import useGlobalSearch from '../lib/useGlobalSearch.js';

const PATIENT_NAV = [
  { to: '/dashboard', label: 'Home', short: 'Home', icon: Home },
  { to: '/memories', label: 'Memories', short: 'Memories', icon: Brain },
  { to: '/people', label: 'People', short: 'People', icon: Users },
  { to: '/schedule', label: 'Routine', short: 'Routine', icon: CalendarDays },
  { to: '/contacts', label: 'Contacts', short: 'Contacts', icon: Phone }
];

const CAREGIVER_NAV = [
  { to: '/caregiver', label: 'Overview', short: 'Overview', icon: Activity },
  { to: '/dashboard', label: 'Patient View', short: 'Patient', icon: Home },
  { to: '/memories', label: 'Memories', short: 'Memories', icon: Brain },
  { to: '/people', label: 'People', short: 'People', icon: Users },
  { to: '/schedule', label: 'Routine', short: 'Routine', icon: CalendarDays },
  { to: '/reminders', label: 'Reminders', short: 'Reminders', icon: Bell },
  { to: '/contacts', label: 'Contacts', short: 'Contacts', icon: Phone }
];

export default function Layout({ children }) {
  const { session, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { results, loading } = useGlobalSearch(query);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const user = session?.user || { name: 'Demo User', role: 'patient' };
  const NAV = user.role === 'caregiver' ? CAREGIVER_NAV : PATIENT_NAV;

  const doLogout = () => {
    logout();
    navigate('/');
  };

  const typeBadge = {
    memory: 'Memory', person: 'Person', event: 'Event', reminder: 'Reminder', contact: 'Contact'
  };
  const typeRoute = {
    memory: '/memories', person: '/people', event: '/schedule', reminder: '/reminders', contact: '/contacts'
  };

  return (
    <div className="min-h-screen flex flex-col bg-nyala-bg relative">
      {/* Topbar */}
      <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-nyala-gray' : 'bg-transparent border-transparent'}`}>
        <div className="flex items-center gap-4 px-6 py-4 mx-auto max-w-7xl">
          <button
            className="p-2 text-slate-600 hover:bg-slate-100 lg:hidden rounded-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          
          <div className="text-xl font-bold font-display text-nyala-primary tracking-tight hidden lg:block mr-8">
            Memory Assistant
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-3 border border-nyala-gray bg-white px-4 py-2.5 text-left text-slate-400 hover:border-nyala-primary transition-colors max-w-lg rounded-sm"
          >
            <Search size={20} />
            <span className="text-sm font-medium">Search...</span>
            <kbd className="ml-auto hidden border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500 font-mono sm:block rounded-sm">Ctrl K</kbd>
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            {user.role !== 'caregiver' && (
              <NavLink to="/caregiver" className="hidden px-4 py-2 text-sm font-semibold text-nyala-primary border border-nyala-primary hover:bg-nyala-primary hover:text-white transition-colors sm:block rounded-sm">
                Caregiver View
              </NavLink>
            )}
            <NavLink to="/settings" className="p-2 text-slate-600 hover:text-nyala-primary transition-colors" aria-label="Settings">
              <Settings size={24} />
            </NavLink>
            <button onClick={doLogout} className="p-2 text-slate-600 hover:text-red-600 transition-colors" aria-label="Log out">
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 mx-auto max-w-7xl w-full">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-nyala-gray bg-white/50 py-8 pr-6">
          <nav className="flex flex-col gap-2" aria-label="Main">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-lg font-bold transition-all rounded-sm border-l-4 ${
                    isActive ? 'border-nyala-primary bg-blue-50/50 text-nyala-primary' : 'border-transparent text-slate-600 hover:bg-white hover:text-nyala-primary'
                  }`
                }
              >
                <Icon size={24} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-nyala-dark/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-80 bg-white p-6 shadow-2xl transition-transform">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-2xl font-bold font-display text-nyala-primary">Memory Assistant</span>
                <button className="p-2 text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={24} /></button>
              </div>
              <nav className="flex flex-col gap-2">
                {NAV.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 text-lg font-bold transition-all rounded-sm border-l-4 ${
                        isActive ? 'border-nyala-primary bg-blue-50/50 text-nyala-primary' : 'border-transparent text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon size={24} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 w-full min-w-0 px-4 py-8 sm:px-8 lg:py-12 opacity-0 animate-slide-up pb-24 lg:pb-12">{children}</main>
      </div>

      {/* Floating AI Companion Button (visible except on companion page) */}
      {location.pathname !== '/companion' && (
        <NavLink
          to="/companion"
          className="fixed bottom-24 lg:bottom-12 right-6 lg:right-12 bg-nyala-primary hover:bg-blue-800 text-white shadow-lg flex items-center gap-3 px-6 py-4 rounded-full transition-all z-40 transform hover:scale-105"
        >
          <MessageCircle size={28} />
          <span className="font-display font-bold text-xl hidden md:inline">Need Help?</span>
        </NavLink>
      )}

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-nyala-gray bg-white lg:hidden pb-safe" aria-label="Primary mobile">
        <div className="flex justify-around items-center h-20">
          {NAV.slice(0, 5).map(({ to, short, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1 text-[11px] uppercase tracking-wider font-bold transition-colors ${
                  isActive ? 'text-nyala-primary border-t-4 border-nyala-primary bg-blue-50/30' : 'text-slate-500 border-t-4 border-transparent hover:bg-slate-50'
                }`
              }
            >
              <Icon size={24} className="mb-1" />
              <span className="truncate">{short}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Global search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
          <div className="absolute inset-0 bg-nyala-dark/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm border border-nyala-gray animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-3 border-b border-nyala-gray px-6 py-4">
              <Search size={24} className="text-nyala-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search memories, people, events, reminders, contacts..."
                className="w-full bg-transparent text-xl font-bold outline-none text-nyala-text placeholder:text-slate-400 py-2"
                aria-label="Global search"
              />
              <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim() === '' && (
                <div className="px-6 py-12 text-center text-slate-500">
                  <p className="text-xl font-bold">Try "Marina", "Riya", "medicine"...</p>
                </div>
              )}
              {loading && <p className="px-6 py-12 text-center text-xl font-bold text-slate-500 animate-pulse">Searching...</p>}
              {!loading && query.trim() !== '' && results.length === 0 && (
                <p className="px-6 py-12 text-center text-xl font-bold text-slate-500">No results for "<span className="text-nyala-text">{query}</span>"</p>
              )}
              {results.map(r => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery('');
                    navigate(typeRoute[r.type] || '/dashboard');
                  }}
                  className="flex w-full items-start gap-4 p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <span className="inline-block mt-1 border border-nyala-primary text-nyala-primary bg-white uppercase font-bold tracking-wider text-xs px-2 py-1 rounded-sm">{typeBadge[r.type] || r.type}</span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xl font-bold text-nyala-text">{r.title}</span>
                    <span className="block truncate text-lg text-slate-500 mt-1">
                      {r.subtitle || r.description || r.location || [r.date, r.time].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
