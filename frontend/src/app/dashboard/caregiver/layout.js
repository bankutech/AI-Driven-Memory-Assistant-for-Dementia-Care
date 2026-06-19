"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getMe } from '../../../utils/api';

export default function CaregiverLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getMe();
        if (!userData || userData.role !== 'CAREGIVER') {
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

  const navItems = [
    { name: 'Overview', path: '/dashboard/caregiver' },
    { name: 'Patients List', path: '/dashboard/caregiver/patients' },
    { name: 'Medication Schedule', path: '/dashboard/caregiver/medications' },
    { name: 'Alerts & Tracking', path: '/dashboard/caregiver/alerts' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }}>
      
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
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: '800', letterSpacing: '-0.02em' }}>MemoryMate</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path} style={{ 
                padding: '0.5rem 0.75rem', 
                background: isActive ? 'rgba(0, 242, 254, 0.05)' : 'transparent', 
                borderLeft: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: isActive ? 'var(--primary-color)' : 'var(--text-muted)', 
                borderRadius: '0 4px 4px 0', 
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => { if(!isActive) e.target.style.background = 'rgba(255,255,255,0.03)' }} 
              onMouseOut={(e) => { if(!isActive) e.target.style.background = 'transparent' }}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Caregiver</p>
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

      {/* Main Content Area */}
      {children}
    </div>
  );
}
