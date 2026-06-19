"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../components/ui/Button';
import AbstractBrain from '../../components/ui/AbstractBrain';
import { loginUser } from '../../utils/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Route based on role
      if (data.user.role === 'ADMIN') router.push('/dashboard/admin');
      else if (data.user.role === 'CAREGIVER') router.push('/dashboard/caregiver');
      else router.push('/dashboard/patient');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Left Side - 3D Graphic */}
      <div style={{ 
        flex: 1, 
        background: 'radial-gradient(circle at center, #1c2b4d 0%, #0b0f19 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <AbstractBrain />
        </div>
        
        {/* Overlay Text */}
        <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none', textAlign: 'center', marginTop: 'auto' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', filter: 'drop-shadow(0 0 10px rgba(0,242,254,0.5))' }}>MemoryMate</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Welcome back to your intelligent care platform.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{ 
        flex: 1, 
        background: 'var(--surface-color)', 
        backdropFilter: 'blur(30px)',
        borderLeft: '1px solid var(--surface-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '1.5rem 8%',
        boxShadow: '-20px 0 50px rgba(0,0,0,0.5)',
        zIndex: 10,
        overflowY: 'auto'
      }}>
        <div style={{ margin: 'auto 0' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>&larr;</span> Back to Home
          </Link>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Sign In</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            Enter your credentials to access your dashboard.
          </p>

          {error && <div style={{ color: '#ff0844', background: 'rgba(255,8,68,0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid rgba(255,8,68,0.3)' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="hello@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                <span>Password</span>
                <a href="#" style={{ fontSize: '0.9rem' }}>Forgot password?</a>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" size="md" block style={{ marginTop: '0.5rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Don't have an account? <Link href="/register" style={{ fontWeight: '700' }}>Create one now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
