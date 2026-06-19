"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMe } from '../../../utils/api';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getMe();
        if (!userData || userData.role !== 'PATIENT') {
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

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem' }}>Loading...</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      background: 'var(--bg-color)', 
      color: 'var(--text-main)', 
      fontFamily: 'var(--font-sans)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* Header */}
      <header style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Hello, {user?.firstName}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>It is Tuesday, Morning.</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--surface-border)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            transition: 'all var(--transition-fast)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          Sign Out
        </button>
      </header>

      {/* Main Actions Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.25rem', 
        width: '100%', 
        maxWidth: '900px' 
      }}>
        
        {/* Live Assistant Button */}
        <Link href="/dashboard/patient/camera" style={{
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem 1.25rem',
          color: '#fff',
          fontSize: '1.25rem',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(0, 242, 254, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          textDecoration: 'none'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 25px rgba(0, 242, 254, 0.3)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 242, 254, 0.2)'; }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            👁️
          </div>
          <div>
            <div style={{ lineHeight: '1.2' }}>Live Assistant</div>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', opacity: 0.8, marginTop: '0.25rem' }}>AI Face Recognition</div>
          </div>
        </Link>

        {/* My Tasks Button */}
        <button style={{
          background: 'var(--surface-color)',
          border: '1px solid var(--surface-border)',
          borderRadius: '16px',
          padding: '1.5rem 1.25rem',
          color: 'var(--text-main)',
          fontSize: '1.25rem',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
          textAlign: 'left'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
        >
          <div style={{ background: 'rgba(255,255,255,0.05)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            ✅
          </div>
          <div>
            <div style={{ lineHeight: '1.2' }}>My Tasks</div>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)', marginTop: '0.25rem' }}>2 pending today</div>
          </div>
        </button>

        {/* My Memories Button */}
        <Link href="/dashboard/patient/timeline" style={{
          background: 'var(--surface-color)',
          border: '1px solid var(--surface-border)',
          borderRadius: '16px',
          padding: '1.5rem 1.25rem',
          color: 'var(--text-main)',
          fontSize: '1.25rem',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
          textDecoration: 'none'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
        >
          <div style={{ background: 'rgba(255,255,255,0.05)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            🖼️
          </div>
          <div>
            <div style={{ lineHeight: '1.2' }}>My Memories</div>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)', marginTop: '0.25rem' }}>View past events</div>
          </div>
        </Link>

        {/* Emergency Contact */}
        <button style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem 1.25rem',
          color: '#ef4444',
          fontSize: '1.25rem',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform var(--transition-fast), background var(--transition-fast)',
          textAlign: 'left'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
        >
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            📞
          </div>
          <div>
            <div style={{ lineHeight: '1.2' }}>Call Help</div>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', opacity: 0.8, marginTop: '0.25rem' }}>Alert caregiver</div>
          </div>
        </button>

      </div>
    </div>
  );
}
