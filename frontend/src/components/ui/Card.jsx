"use client";
import React, { useRef, useState } from 'react';

export default function Card({ children, className = '', ...props }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-panel p-6 ${className}`} 
      style={{ 
        padding: '2.5rem', 
        transform,
        transition: transform === 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' ? 'transform 0.5s ease' : 'none',
        willChange: 'transform'
      }} 
      {...props}
    >
      <div style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>
    </div>
  );
}
