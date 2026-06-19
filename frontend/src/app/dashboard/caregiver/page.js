"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPatients } from '../../../utils/api';

export default function CaregiverDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsData = await getPatients();
        setPatients(patientsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</main>;

  return (
    <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Monitor your assigned patients and daily tasks.</p>
        </div>
        <button style={{
          background: 'var(--primary-color)',
          color: '#000',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 242, 254, 0.2)',
          transition: 'transform var(--transition-fast)'
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          + Add New Patient
        </button>
      </header>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Active Patients</h3>
            <span style={{ fontSize: '1rem' }}>👥</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', lineHeight: '1' }}>{patients.length}</p>
            <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>↑ 1 New</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Pending Alerts</h3>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', lineHeight: '1', color: 'var(--text-main)' }}>1</p>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Action Req</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Medications</h3>
            <span style={{ fontSize: '1rem' }}>💊</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-display)', lineHeight: '1' }}>4</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due today</span>
          </div>
        </div>

      </div>

      {/* Recent Patient Activity (Timeline) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Recent Patient Activity</h2>
          <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>View all</a>
        </div>
        
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '0', overflow: 'hidden' }}>
          
          {/* Timeline Item 1 */}
          <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-border)', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.875rem' }}>
              ⚠️
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.2' }}>Wandering Alert: John Doe</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Patient left the designated safe zone perimeter.</p>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10:30 AM</div>
          </div>

          {/* Timeline Item 2 */}
          <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--surface-border)', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.875rem' }}>
              💊
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.2' }}>Medication Taken: Mary Smith</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Morning dosage of Donepezil (5mg) logged successfully.</p>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>08:00 AM</div>
          </div>

          {/* Timeline Item 3 */}
          <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.875rem' }}>
              📝
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.2' }}>Health Log Updated: Robert Jones</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Caregiver reported good sleep quality and calm mood.</p>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yesterday, 9:00 PM</div>
          </div>

        </div>
      </section>

    </main>
  );
}
