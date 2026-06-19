"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home() {
  
  useEffect(() => {
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.1 });
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-container">
      {/* 3D Background Orbs */}
      <div className="bg-orb" style={{ top: '10%', left: '10%', width: '400px', height: '400px', background: 'var(--primary-color)' }}></div>
      <div className="bg-orb" style={{ top: '60%', right: '5%', width: '500px', height: '500px', background: 'var(--secondary-color)', animationDelay: '-5s' }}></div>
      <div className="bg-orb" style={{ top: '40%', left: '40%', width: '300px', height: '300px', background: 'var(--accent-color)', animationDelay: '-2s' }}></div>

      {/* Navbar */}
      <nav style={{ 
        padding: '1.25rem 5%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11, 15, 25, 0.6)',
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '1.75rem', 
          fontWeight: '800', 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 10px var(--primary-glow))' }}>🧠</span> 
          <span className="text-gradient">MemoryMate</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" style={{ fontWeight: '600', marginRight: '1rem' }}>
            Sign In
          </Link>
          <Link href="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main style={{ width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <section style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          minHeight: '80vh',
          justifyContent: 'center',
          padding: '4rem 5%',
          perspective: '1000px'
        }}>
          <div className="reveal" style={{ maxWidth: '900px' }}>
            <div style={{ 
              display: 'inline-block',
              background: 'rgba(0, 242, 254, 0.1)', 
              color: 'var(--primary-color)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: '700',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)'
            }}>
              A New Standard in Care
            </div>
            
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
              Compassionate Care, <br /> Powered by <span className="text-gradient">Intelligence</span>.
            </h1>
            
            <p style={{ 
              fontSize: '1.35rem', 
              color: 'var(--text-muted)', 
              marginBottom: '3rem',
              maxWidth: '700px',
              margin: '0 auto 3rem auto',
              lineHeight: '1.8'
            }}>
              MemoryMate is a personalized daily companion for individuals living with dementia, bridging the gap between independence and peace of mind for caregivers.
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <Link href="/register?role=patient">
                <Button size="lg" variant="primary">I am a Patient</Button>
              </Link>
              <Link href="/register?role=caregiver">
                <Button size="lg" variant="secondary">I am a Caregiver</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Parallax / 3D Separator */}
        <div style={{ height: '150px', background: 'linear-gradient(180deg, transparent, rgba(20, 25, 40, 0.8))' }}></div>

        {/* Features Section */}
        <section style={{ padding: '6rem 5%', background: 'rgba(20, 25, 40, 0.8)', position: 'relative' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="reveal" style={{ textAlign: 'center', fontSize: '3.5rem', marginBottom: '5rem' }}>
              Designed for <span className="text-gradient">Everyday Life</span>
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '3rem' 
            }}>
              <Card className="reveal-left" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1.5rem',
                  background: 'rgba(0, 242, 254, 0.1)',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '1.25rem',
                  boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)'
                }}>🎙️</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Conversational AI</h3>
                <p style={{ color: 'var(--text-muted)' }}>An always-available, patient voice assistant that answers repetitive questions, provides daily orientation, and gently guides through tasks.</p>
              </Card>

              <Card className="reveal" style={{ display: 'flex', flexDirection: 'column', transform: 'translateY(-20px)' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1.5rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '1.25rem',
                  boxShadow: '0 0 20px rgba(102, 126, 234, 0.2)'
                }}>⏱️</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Memory Timeline</h3>
                <p style={{ color: 'var(--text-muted)' }}>A beautifully organized gallery of photos, videos, and voice notes linked to important life events to help patients stay connected to their past.</p>
              </Card>

              <Card className="reveal-right" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1.5rem',
                  background: 'rgba(255, 8, 68, 0.1)',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '1.25rem',
                  boxShadow: '0 0 20px rgba(255, 8, 68, 0.2)'
                }}>📍</div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Safety & Location</h3>
                <p style={{ color: 'var(--text-muted)' }}>Real-time GPS safety monitoring with custom geo-fenced safe zones. Caregivers receive instant alerts if the patient wanders.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section style={{ padding: '8rem 5%', textAlign: 'center', position: 'relative' }}>
          <div className="reveal" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--surface-color)', backdropFilter: 'blur(20px)', padding: '4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to <span className="text-gradient">Experience</span> the Future of Care?</h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
              Join thousands of families relying on MemoryMate for peace of mind and enhanced independence.
            </p>
            <Button size="lg" variant="primary">Create Your Account</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
