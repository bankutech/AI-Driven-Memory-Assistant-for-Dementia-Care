"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '../../components/ui/Button';
import AbstractBrain from '../../components/ui/AbstractBrain';

import { registerUser } from '../../utils/api';

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'caregiver';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: defaultRole.toUpperCase()
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(formData);
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
      
      {/* Left Side - Form */}
      <div style={{ 
        flex: 1, 
        background: 'var(--surface-color)', 
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid var(--surface-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '1rem 8%',
        boxShadow: '20px 0 50px rgba(0,0,0,0.5)',
        zIndex: 10
      }}>
        <div style={{ margin: 'auto 0' }}>
        
        <Link href="/" style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
          <span>&larr;</span> Back to Home
        </Link>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          Join MemoryMate to experience the future of care.
        </p>

        {error && <div style={{ color: '#ff0844', background: 'rgba(255,8,68,0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', border: '1px solid rgba(255,8,68,0.3)', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.15rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>First Name</label>
              <input 
                type="text" 
                name="firstName"
                placeholder="John" 
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.15rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last Name</label>
              <input 
                type="text" 
                name="lastName"
                placeholder="Doe" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.15rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="hello@example.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.15rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.15rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>I am signing up as a:</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{ cursor: 'pointer' }}
            >
              <option value="CAREGIVER">Caregiver (Managing Care)</option>
              <option value="PATIENT">Patient (Receiving Care)</option>
            </select>
          </div>

          <Button type="submit" variant="primary" block style={{ marginTop: '0.25rem', padding: '0.5rem', fontSize: '0.95rem' }} disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>

        <p style={{ marginTop: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Already have an account? <Link href="/login" style={{ fontWeight: '700' }}>Sign In</Link>
        </p>
        </div>

      </div>

      {/* Right Side - 3D Graphic */}
      <div style={{ 
        flex: 1, 
        background: 'radial-gradient(circle at center, #1c2b4d 0%, #0b0f19 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        zIndex: 1
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <AbstractBrain />
        </div>
        
        {/* Overlay Text */}
        <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none', textAlign: 'center', marginTop: 'auto' }}>
          <h2 style={{ fontSize: '3rem', color: 'var(--primary-color)', filter: 'drop-shadow(0 0 10px rgba(0,242,254,0.5))' }}>MemoryMate</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Connecting memories, ensuring safety.</p>
        </div>
      </div>

    </div>
  );
}
