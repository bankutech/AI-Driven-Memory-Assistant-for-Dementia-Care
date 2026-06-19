"use client";
import React from 'react';

export default function AlertsTracking() {
  const alerts = [
    { id: 1, type: 'WANDERING', patient: 'John Doe', time: '10:30 AM', desc: 'Patient exited the defined Home Safe Zone. Last known location: Oak Street.' },
    { id: 2, type: 'MISSED_MEDICATION', patient: 'Robert Jones', time: 'Yesterday', desc: 'Missed evening dose of Memantine (10mg).' },
    { id: 3, type: 'FALL_DETECTED', patient: 'Mary Smith', time: 'Oct 12', desc: 'Possible fall detected by wearable device. Caregiver dispatched.' }
  ];

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#ef4444' }}>Alerts & Tracking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Live GPS tracking and critical safety alerts.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Map Placeholder */}
        <div style={{ 
          background: 'var(--surface-color)', 
          border: '1px solid var(--surface-border)', 
          borderRadius: '12px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Mock Map Background */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(var(--primary-color) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <span style={{ fontSize: '4rem', marginBottom: '1rem', zIndex: 1 }}>🗺️</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', zIndex: 1 }}>Live Tracking Map</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', zIndex: 1 }}>Integration with Google Maps API pending.</p>
          
          {/* Mock Pin */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '24px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, animation: 'pulse 2s infinite' }}>
            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
          </div>
        </div>

        {/* Alerts Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Active Alerts</h2>
          
          {alerts.map(alert => (
            <div key={alert.id} style={{ 
              background: 'var(--surface-color)', 
              border: alert.type === 'WANDERING' || alert.type === 'FALL_DETECTED' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--surface-border)', 
              borderRadius: '12px', 
              padding: '1.25rem',
              borderLeft: alert.type === 'WANDERING' || alert.type === 'FALL_DETECTED' ? '4px solid #ef4444' : '4px solid #f59e0b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: alert.type === 'WANDERING' || alert.type === 'FALL_DETECTED' ? '#ef4444' : '#f59e0b' }}>
                  {alert.type.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alert.time}</span>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>{alert.patient}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{alert.desc}</p>
              
              <button style={{ 
                marginTop: '1rem', 
                background: 'rgba(255,255,255,0.05)', 
                border: 'none', 
                color: 'var(--text-main)', 
                padding: '0.4rem 0.75rem', 
                fontSize: '0.75rem', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}>
                Resolve
              </button>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
