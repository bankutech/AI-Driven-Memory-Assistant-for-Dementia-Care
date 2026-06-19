"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../../../utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getMe();
        if (!userData || userData.role !== 'ADMIN') {
          router.push('/login');
          return;
        }
        setUser(userData);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ 
        width: '240px', 
        background: 'var(--surface-color)', 
        borderRight: '1px solid var(--surface-border)', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        zIndex: 10
      }}>
        <div style={{ padding: '0 0.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: '800', letterSpacing: '-0.02em' }}>MemoryMate Admin</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <a href="#" style={{ 
            padding: '0.5rem 0.75rem', 
            background: 'rgba(0, 242, 254, 0.05)', 
            borderLeft: '2px solid var(--primary-color)',
            color: 'var(--primary-color)', 
            borderRadius: '0 4px 4px 0', 
            fontSize: '0.875rem',
            fontWeight: '600',
            textDecoration: 'none'
          }}>System Overview</a>
          
          <a href="#" style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderRadius: '4px', textDecoration: 'none' }}>User Management</a>
          <a href="#" style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderRadius: '4px', textDecoration: 'none' }}>System Settings</a>
          <a href="#" style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem', borderRadius: '4px', textDecoration: 'none' }}>Analytics & Reports</a>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.15rem' }}>Administrator</p>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
              title="Sign Out"
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Platform Analytics</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Global overview of MemoryMate platform health and user activity.</p>
          </div>
        </header>

        {/* System Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Users</h3>
              <span style={{ fontSize: '1rem' }}>🌐</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-display)', lineHeight: '1' }}>1,248</p>
              <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>↑ 12%</span>
            </div>
          </div>

          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Server Uptime</h3>
              <span style={{ fontSize: '1rem' }}>⚡</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-display)', lineHeight: '1', color: '#10b981' }}>99.9%</p>
            </div>
          </div>

          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Active Alerts</h3>
              <span style={{ fontSize: '1rem' }}>🚨</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-display)', lineHeight: '1', color: '#ef4444' }}>23</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across 15 regions</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
