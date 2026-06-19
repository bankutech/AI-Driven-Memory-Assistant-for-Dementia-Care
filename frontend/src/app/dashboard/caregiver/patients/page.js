"use client";
import React, { useEffect, useState } from 'react';
import { getPatients } from '../../../../utils/api';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</main>;

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Patients List</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage and view details for all assigned patients.</p>
        </div>
        <button style={{
          background: 'var(--surface-color)',
          color: 'var(--text-main)',
          border: '1px solid var(--surface-border)',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        onMouseOut={(e) => e.target.style.background = 'var(--surface-color)'}
        >
          Export Data
        </button>
      </header>

      {/* Patient Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {patients.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No patients assigned to you currently.</p>
        ) : (
          patients.map((patient) => (
            <div key={patient.id} style={{ 
              background: 'var(--surface-color)', 
              border: '1px solid var(--surface-border)', 
              borderRadius: '12px', 
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{patient.firstName} {patient.lastName}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{patient.email}</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Status</p>
                  <p style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>Stable</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Last Activity</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>2 hours ago</p>
                </div>
              </div>

              <button style={{
                marginTop: '0.5rem',
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--primary-color)',
                color: 'var(--primary-color)',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.target.style.background = 'var(--primary-color)'; e.target.style.color = '#000'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary-color)'; }}
              >
                View Full Profile
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
