"use client";
import React from 'react';

export default function MedicationSchedule() {
  const schedule = [
    { time: '08:00 AM', name: 'Donepezil', dosage: '5mg', patient: 'Mary Smith', status: 'Taken' },
    { time: '01:00 PM', name: 'Memantine', dosage: '10mg', patient: 'John Doe', status: 'Pending' },
    { time: '06:00 PM', name: 'Vitamin D', dosage: '1000 IU', patient: 'Mary Smith', status: 'Pending' },
    { time: '08:00 PM', name: 'Donepezil', dosage: '5mg', patient: 'Robert Jones', status: 'Pending' }
  ];

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Medication Schedule</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Track and manage daily medication plans.</p>
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
          boxShadow: '0 4px 12px rgba(0, 242, 254, 0.2)'
        }}>
          + Add Prescription
        </button>
      </header>

      <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Time</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Patient</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Medication</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Dosage</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, i) => (
              <tr key={i} style={{ borderBottom: i !== schedule.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600' }}>{item.time}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{item.patient}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{item.dosage}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    background: item.status === 'Taken' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: item.status === 'Taken' ? '#10b981' : '#f59e0b'
                  }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
