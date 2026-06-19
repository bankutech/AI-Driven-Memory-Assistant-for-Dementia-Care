"use client";
import React from 'react';
import Link from 'next/link';

export default function MemoryTimeline() {
  const memories = [
    { id: 1, date: '1985', title: 'Wedding Day', desc: 'Married to Thomas at St. Jude Church. A beautiful summer day.', type: 'photo', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
    { id: 2, date: '1992', title: 'Birth of Sarah', desc: 'Welcomed our first daughter, Sarah, into the world.', type: 'photo', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80' },
    { id: 3, date: '2015', title: 'Retirement Party', desc: 'Retired after 30 years of teaching at the local high school.', type: 'photo', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '2rem' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        <Link href="/dashboard/patient" style={{ 
          fontSize: '1.5rem', 
          color: 'var(--primary-color)', 
          textDecoration: 'none',
          padding: '1rem',
          border: '2px solid var(--primary-color)',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          &larr; Back Home
        </Link>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)' }}>My Memories</h1>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Timeline Line */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '40px', top: 0, bottom: 0, width: '4px', background: 'var(--surface-border)' }}></div>

          {memories.map((memory) => (
            <div key={memory.id} style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', position: 'relative' }}>
              
              {/* Timeline Dot */}
              <div style={{ width: '80px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-color)', border: '4px solid var(--bg-color)', zIndex: 1, marginTop: '1rem' }}></div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem', color: 'var(--primary-color)' }}>{memory.date}</div>
              </div>

              {/* Memory Card */}
              <div style={{ 
                background: 'var(--surface-color)', 
                border: '2px solid var(--surface-border)', 
                borderRadius: '24px', 
                overflow: 'hidden',
                flex: 1,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <img src={memory.url} alt={memory.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>{memory.title}</h2>
                  <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{memory.desc}</p>
                  
                  <button style={{
                    marginTop: '2rem',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '2px solid var(--primary-color)',
                    color: 'var(--primary-color)',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>🔊</span> Listen to Story
                  </button>
                </div>
              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
