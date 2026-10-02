import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Layout from './components/Layout.jsx';
import ToastHost from './components/ToastHost.jsx';
import Welcome from './pages/Welcome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MemoryVault from './pages/MemoryVault.jsx';
import People from './pages/People.jsx';
import Schedule from './pages/Schedule.jsx';
import Reminders from './pages/Reminders.jsx';
import Companion from './pages/Companion.jsx';
import Contacts from './pages/Contacts.jsx';
import Caregiver from './pages/Caregiver.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';

function Protected({ children }) {
  const { session } = useApp();
  const location = useLocation();
  if (!session) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
}

function AppShell() {
  const { session } = useApp();
  return (
    <>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Welcome />} />
        <Route path="/login" element={<Welcome />} />
        <Route
          path="/dashboard"
          element={<Protected><Layout><Dashboard /></Layout></Protected>}
        />
        <Route
          path="/memories"
          element={<Protected><Layout><MemoryVault /></Layout></Protected>}
        />
        <Route
          path="/people"
          element={<Protected><Layout><People /></Layout></Protected>}
        />
        <Route
          path="/schedule"
          element={<Protected><Layout><Schedule /></Layout></Protected>}
        />
        <Route
          path="/reminders"
          element={<Protected><Layout><Reminders /></Layout></Protected>}
        />
        <Route
          path="/companion"
          element={<Protected><Layout><Companion /></Layout></Protected>}
        />
        <Route
          path="/contacts"
          element={<Protected><Layout><Contacts /></Layout></Protected>}
        />
        <Route
          path="/caregiver"
          element={<Protected><Layout><Caregiver /></Layout></Protected>}
        />
        <Route
          path="/settings"
          element={<Protected><Layout><Settings /></Layout></Protected>}
        />
        <Route
          path="/profile"
          element={<Protected><Layout><Profile /></Layout></Protected>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
